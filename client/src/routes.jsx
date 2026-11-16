/* ============================================================
   Every address in the app lives here. Nothing else decides a route.
   ============================================================ */
import { Route, Routes } from 'react-router-dom'

import SiteLayout from './layouts/SiteLayout.jsx'
import AdminLayout from './layouts/AdminLayout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

import Landing from './pages/Landing.jsx'
import ItemList from './pages/ItemList.jsx'
import ItemDetail from './pages/ItemDetail.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import ReportItem from './pages/ReportItem.jsx'
import MyReports from './pages/MyReports.jsx'
import MyClaims from './pages/MyClaims.jsx'
import SubmitClaim from './pages/SubmitClaim.jsx'
import Profile from './pages/Profile.jsx'
import NotFound from './pages/NotFound.jsx'

import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminClaims from './pages/admin/AdminClaims.jsx'
import ClaimReview from './pages/admin/ClaimReview.jsx'
import ManageItems from './pages/admin/ManageItems.jsx'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<Landing />} />
        <Route path="lost" element={<ItemList type="lost" />} />
        <Route path="found" element={<ItemList type="found" />} />
        <Route path="items/:id" element={<ItemDetail />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />

        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="report"
          element={
            <ProtectedRoute>
              <ReportItem />
            </ProtectedRoute>
          }
        />
        <Route
          path="my-reports"
          element={
            <ProtectedRoute>
              <MyReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="my-claims"
          element={
            <ProtectedRoute>
              <MyClaims />
            </ProtectedRoute>
          }
        />
        <Route
          path="items/:id/claim"
          element={
            <ProtectedRoute>
              <SubmitClaim />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route
        path="admin"
        element={
          <ProtectedRoute adminOnly>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="claims" element={<AdminClaims />} />
        <Route path="claims/:id" element={<ClaimReview />} />
        <Route path="items" element={<ManageItems />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
