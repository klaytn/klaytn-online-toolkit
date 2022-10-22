import { Component } from 'react'

export type RouteType = {
  name: string
  path: string
  items: {
    path: string
    name: string
    component: any
  }[]
}
