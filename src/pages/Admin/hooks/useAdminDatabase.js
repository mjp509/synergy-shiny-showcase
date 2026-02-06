import { useState, useCallback, useRef, useMemo } from 'react'
import { API } from '../../../api/endpoints'

function recalcShinyCount(playerObj) {
  const shinies = playerObj?.shinies
  if (!shinies) return 0
  return Object.values(shinies).filter(s => s.Sold !== 'Yes').length
}

function reindexShinies(shiniesObj) {
  const reindexed = {}
  Object.keys(shiniesObj)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .forEach((key, index) => { reindexed[index + 1] = shiniesObj[key] })
  return reindexed
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

export default function useAdminDatabase(auth) {
  const [database, setDatabase] = useState({})
  const [streamersDB, setStreamersDB] = useState({})
  const [logData, setLogData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isMutating, setIsMutating] = useState(false)
  const snapshotRef = useRef(null)

  const postData = useCallback(async (endpoint, payload) => {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    return res.json()
  }, [])

  const loadDatabase = useCallback(async () => {
    setIsLoading(true)
    try {
      const [dbRes, streamersRes, logRes] = await Promise.all([
        fetch(API.database),
        fetch(API.streamers),
        fetch(API.adminLog),
      ])
      const db = await dbRes.json()
      const str = await streamersRes.json()
      const log = await logRes.json()

      Object.keys(db).forEach(p => {
        db[p].shiny_count = recalcShinyCount(db[p])
      })

      setDatabase(db)
      setStreamersDB(str)
      setLogData(log.log || [])
      return { db, str, log: log.log || [] }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const saveSnapshot = useCallback(() => {
    snapshotRef.current = {
      database: deepClone(database),
      streamersDB: deepClone(streamersDB),
    }
  }, [database, streamersDB])

  const undo = useCallback(async () => {
    if (!snapshotRef.current || !auth) return false
    setIsMutating(true)
    try {
      const { database: prevDb, streamersDB: prevStr } = snapshotRef.current
      const [dbResult, strResult] = await Promise.all([
        postData(API.updateDatabase, {
          username: auth.name, password: auth.password,
          data: prevDb, action: 'Undo last action',
        }),
        postData(API.updateStreamers, {
          username: auth.name, password: auth.password,
          data: prevStr, action: 'Undo last action (streamers)',
        }),
      ])
      if (dbResult.success && strResult.success) {
        setDatabase(prevDb)
        setStreamersDB(prevStr)
        snapshotRef.current = null
        return true
      }
      return false
    } finally {
      setIsMutating(false)
    }
  }, [auth, postData])

  const addShiny = useCallback(async (playerName, shinyData) => {
    if (!auth) return { success: false, error: 'Unauthorized' }
    saveSnapshot()
    setIsMutating(true)
    try {
      const db = deepClone(database)
      if (!db[playerName]) db[playerName] = { shiny_count: 0, shinies: {} }
      const nextId = Object.keys(db[playerName].shinies).length + 1
      db[playerName].shinies[nextId] = shinyData
      db[playerName].shiny_count = recalcShinyCount(db[playerName])

      const result = await postData(API.updateDatabase, {
        username: auth.name, password: auth.password, data: db,
        action: `Added ${shinyData.Pokemon} for ${playerName}`,
      })
      if (result.success) {
        setDatabase(db)
        return { success: true }
      }
      return { success: false, error: 'Server rejected update' }
    } finally {
      setIsMutating(false)
    }
  }, [auth, database, postData, saveSnapshot])

  const editShiny = useCallback(async (playerName, shinyId, shinyData) => {
    if (!auth) return { success: false, error: 'Unauthorized' }
    saveSnapshot()
    setIsMutating(true)
    try {
      const db = deepClone(database)
      if (!db[playerName]?.shinies?.[shinyId]) {
        return { success: false, error: 'Entry not found' }
      }
      db[playerName].shinies[shinyId] = shinyData
      db[playerName].shiny_count = recalcShinyCount(db[playerName])

      const result = await postData(API.updateDatabase, {
        username: auth.name, password: auth.password, data: db,
        action: `Edited shiny #${shinyId} (${shinyData.Pokemon}) for ${playerName}`,
      })
      if (result.success) {
        setDatabase(db)
        return { success: true }
      }
      return { success: false, error: 'Server rejected update' }
    } finally {
      setIsMutating(false)
    }
  }, [auth, database, postData, saveSnapshot])

  const deleteShiny = useCallback(async (playerName, shinyId) => {
    if (!auth) return { success: false, error: 'Unauthorized' }
    saveSnapshot()
    setIsMutating(true)
    try {
      const db = deepClone(database)
      if (!db[playerName]?.shinies?.[shinyId]) {
        return { success: false, error: 'Entry not found' }
      }
      const pokemonName = db[playerName].shinies[shinyId].Pokemon
      delete db[playerName].shinies[shinyId]
      db[playerName].shinies = reindexShinies(db[playerName].shinies)
      db[playerName].shiny_count = recalcShinyCount(db[playerName])

      const result = await postData(API.updateDatabase, {
        username: auth.name, password: auth.password, data: db,
        action: `Deleted ${pokemonName} (ID ${shinyId}) for ${playerName}`,
      })
      if (result.success) {
        setDatabase(db)
        return { success: true }
      }
      return { success: false, error: 'Server rejected update' }
    } finally {
      setIsMutating(false)
    }
  }, [auth, database, postData, saveSnapshot])

  const deletePlayer = useCallback(async (playerName) => {
    if (!auth) return { success: false, error: 'Unauthorized' }
    saveSnapshot()
    setIsMutating(true)
    try {
      const db = deepClone(database)
      if (!db[playerName]) {
        return { success: false, error: 'Player not found' }
      }
      delete db[playerName]

      const result = await postData(API.updateDatabase, {
        username: auth.name, password: auth.password, data: db,
        action: `Deleted all data for player ${playerName}`,
      })
      if (result.success) {
        setDatabase(db)
        return { success: true }
      }
      return { success: false, error: 'Server rejected update' }
    } finally {
      setIsMutating(false)
    }
  }, [auth, database, postData, saveSnapshot])

  const addStreamer = useCallback(async (pokeName, twitchName) => {
    if (!auth) return { success: false, error: 'Unauthorized' }
    saveSnapshot()
    setIsMutating(true)
    try {
      const str = deepClone(streamersDB)

      str[pokeName] = {
        twitch_username: twitchName,
        profile_image_url: '',   
        last_stream_title: null,
        last_viewer_count: 0,
        live: false
      }

      const result = await postData(API.updateStreamers, {
        username: auth.name,
        password: auth.password,
        data: str,
        action: `Added streamer ${pokeName}`,
      })

      if (result.success) {
        setStreamersDB(str)
        return { success: true }
      }

      return { success: false, error: 'Server rejected update' }
    } finally {
      setIsMutating(false)
    }
  }, [auth, streamersDB, postData, saveSnapshot])


  const deleteStreamer = useCallback(async (pokeName) => {
    if (!auth) return { success: false, error: 'Unauthorized' }
    saveSnapshot()
    setIsMutating(true)
    try {
      const str = deepClone(streamersDB)
      if (!str[pokeName]) {
        return { success: false, error: 'Streamer not found' }
      }
      delete str[pokeName]

      const result = await postData(API.updateStreamers, {
        username: auth.name, password: auth.password, data: str,
        action: `Deleted streamer ${pokeName}`,
      })
      if (result.success) {
        setStreamersDB(str)
        return { success: true }
      }
      return { success: false, error: 'Server rejected update' }
    } finally {
      setIsMutating(false)
    }
  }, [auth, streamersDB, postData, saveSnapshot])

  const updateFullDatabase = useCallback(async (data, action) => {
    if (!auth) return { success: false, error: 'Unauthorized' }
    saveSnapshot()
    setIsMutating(true)
    try {
      const result = await postData(API.updateDatabase, {
        username: auth.name, password: auth.password, data,
        action: action || 'Manual JSON edit (pokemon)',
      })
      if (result.success) {
        setDatabase(data)
        return { success: true }
      }
      return { success: false, error: 'Server rejected update' }
    } finally {
      setIsMutating(false)
    }
  }, [auth, postData, saveSnapshot])

  const updateFullStreamers = useCallback(async (data, action) => {
    if (!auth) return { success: false, error: 'Unauthorized' }
    saveSnapshot()
    setIsMutating(true)
    try {
      const result = await postData(API.updateStreamers, {
        username: auth.name, password: auth.password, data,
        action: action || 'Manual JSON edit (streamers)',
      })
      if (result.success) {
        setStreamersDB(data)
        return { success: true }
      }
      return { success: false, error: 'Server rejected update' }
    } finally {
      setIsMutating(false)
    }
  }, [auth, postData, saveSnapshot])

  const playerNames = useMemo(() => Object.keys(database).sort(), [database])

  const getPlayerShinies = useCallback((name) => {
    return database[name]?.shinies || {}
  }, [database])

  const allPokemonNames = useMemo(() => {
    const all = Object.values(database).flatMap(p =>
      Object.values(p.shinies || {}).map(s => s.Pokemon)
    )
    return [...new Map(all.map(p => [p.toLowerCase(), p])).values()]
      .map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
  }, [database])

  const hasSnapshot = !!snapshotRef.current

  return {
    database, streamersDB, logData, isLoading, isMutating, hasSnapshot,
    loadDatabase, addShiny, editShiny, deleteShiny, deletePlayer,
    addStreamer, deleteStreamer, updateFullDatabase, updateFullStreamers,
    undo, playerNames, getPlayerShinies, allPokemonNames,
  }
}
