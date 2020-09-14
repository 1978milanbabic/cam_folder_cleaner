import React from 'react'

const Context = React.createContext({
  socket: null
})

export default Context
export const SocketProvider = Context.Provider
export const SocketConsumer = Context.Consumer
