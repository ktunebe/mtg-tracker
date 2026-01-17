import React from "react"
import { Navigate } from "react-router-dom"
import { getToken } from "../lib/auth"

export function ProtectedRoute({ children }) {
  return getToken() ? children : <Navigate to="/login" replace />
}
