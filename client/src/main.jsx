import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter } from "react-router-dom";
import { persistor } from "./store/store.jsx";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store } from './store/store.jsx';
import ChatProvider from './Context/ChatProvider.jsx';
import { ErrorBoundary } from "react-error-boundary";
import ErrorBoundaryPage from './pages/ErrorBoundary.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
     <ErrorBoundary fallback={<ErrorBoundaryPage />}>
    <Provider store = {store}>
    <PersistGate loading={null} persistor={persistor}>
      <BrowserRouter>
      <ChakraProvider>
        <ChatProvider>
      <App />
      </ChatProvider>
      </ChakraProvider>
      </BrowserRouter>
      </PersistGate>
    </Provider>
    </ErrorBoundary>
  </React.StrictMode>,
)
