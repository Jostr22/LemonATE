import { HashRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { LangProvider } from './context/LangContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { StoreProvider } from './context/StoreContext.jsx';
import { CartProvider } from './context/CartContext.jsx';

import Home from './pages/Home.jsx';
import Shop from './pages/Shop.jsx';
import Product from './pages/Product.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import Track from './pages/Track.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Account from './pages/Account.jsx';
import Admin from './pages/Admin.jsx';
import Contact from './pages/Contact.jsx';
import Brand from './pages/Brand.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <HashRouter>
      <LangProvider>
        <ToastProvider>
          <AuthProvider>
            <StoreProvider>
              <CartProvider>
                <Routes>
                  <Route element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="tienda" element={<Shop />} />
                    <Route path="tienda/:category" element={<Shop />} />
                    <Route path="promociones" element={<Shop mode="promos" />} />
                    <Route path="producto/:id" element={<Product />} />
                    <Route path="carrito" element={<Cart />} />
                    <Route path="checkout" element={<Checkout />} />
                    <Route path="seguimiento" element={<Track />} />
                    <Route path="login" element={<Login />} />
                    <Route path="registro" element={<Register />} />
                    <Route path="contacto" element={<Contact />} />
                    <Route path="marca" element={<Brand />} />
                    <Route
                      path="cuenta"
                      element={
                        <ProtectedRoute>
                          <Account />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="admin"
                      element={
                        <ProtectedRoute admin>
                          <Admin />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Routes>
              </CartProvider>
            </StoreProvider>
          </AuthProvider>
        </ToastProvider>
      </LangProvider>
    </HashRouter>
  );
}
