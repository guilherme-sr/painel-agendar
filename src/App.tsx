import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import React from "react";
import "./App.css";
import Home from "./pages/Home/home";
import Login from "./pages/Login/login";
import { ConfigProvider } from "antd";
import locale from "antd/locale/pt_BR";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
dayjs.locale("pt_BR");

const App: React.FC = () => {
  return (
    <ConfigProvider locale={locale}>
      <Router>
        <Routes>
          <Route path="/" Component={Home} />
          <Route path="/login" Component={Login} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
};

export default App;
