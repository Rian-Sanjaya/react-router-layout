import * as React from "react";
import { Routes, Route, NavLink, Link, Outlet, useParams, useNavigate, useLocation, useSearchParams, Navigate } from 'react-router-dom';

const Navigation = () => {
  // let { token, onLogout } = useAuth();
  let { onLogout } = useAuth();
  const style = ({ isActive }) => ({
    fontWeight: isActive ? "bold" : "normal",
    marginRight: '4px',
  });

  const token = getToken();

  return (
    <nav
      style={{
        borderBottom: 'solid 1px',
        paddingBottom: '1rem',
      }}
    >
      {!token && 
        <NavLink to="/home" style={style}>Home</NavLink>      
      }

      {token && 
        <>
          <NavLink to="/dashboard" style={style}>Dashboard</NavLink>
          <NavLink to="/users" style={style}>Users</NavLink>
          <button type="button" onClick={onLogout}>
            Sign Out
          </button>
        </>
      }
    </nav>
  );
};

const Layout = () => {
  return (
    <>
      <h1>React Router Layout</h1>

      <Navigation />

      <main style={{ padding: "1rem 0" }}>
        <Outlet />
      </main>
    </>
  );
};

const Home = () => {
  const { onLogin } = useAuth();

  return (
    <>
      <h2>Home (Public)</h2>

      <button type="button" onClick={onLogin}>
        Sign In
      </button>
    </>
  );
};

const Dashboard = () => {
  // let { token } = useAuth();
  
  const token = getToken();

  return (
    <>
      <h2>Dashboard (Protected)</h2>
      <div>Authenticated as {token}</div>
    </>
  );
}

const Users = ({ users }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = searchParams.get("name") || "";

  const handleSearch = (event) => {
    const name = event.target.value;

    if (name) {
      setSearchParams({ name });
    } else {
      setSearchParams({});
    }
  }

  return (
    <>
      <h2>Users (Protected)</h2>

      <input type="text" value={searchTerm} onChange={handleSearch} />

      <ul>
        {users && 
          users
          .filter((user) => 
            user.fullName.toLowerCase().includes(searchTerm.toLocaleLowerCase())
          )
          .map((user) => (
          <li key={user.id}>
            <Link to={`/users/${user.id}`}>
              {user.fullName}
            </Link>
          </li>
        ))}
      </ul>

      <Outlet />
    </>
  );
};

const User = ({ onRemoveUser }) => {
  const { userId } = useParams();

  return (
    <>
      <h2>User: {userId}</h2>

      <button type="button" onClick={() => onRemoveUser(userId)}>
        Remove
      </button>

      <Link to="/users">Back to Users</Link>
    </>
  );
};

const Analytics = () => {
  return (
    <h2>
      Analytics (Protected: authenticated user with permission 'analyze' required)
    </h2>
  );
};

const Admin = () => {
  return (
    <h2>
      Admin (Protected: authenticated user with role 'admin' required)
    </h2>
  );
};

const NoMatch = () => {
  return (
    <p>There's no match: 404!</p>
  );
};

const getToken = () => localStorage.getItem("token");

// function to generate fake token
const fakeAuth = () => (
  new Promise((resolve) => {
    setTimeout(() => resolve("2342f2f1d131rf12"), 250);
  })
);

const AuthContext = React.createContext(null);

// return AuthContext context value object
const useAuth = () => {
  return React.useContext(AuthContext);
}

const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  // const [token, setToken] = React.useState(null);
  
  const handleLogin = async () => {
    const fakeToken = await fakeAuth();

    // setToken(token);
    localStorage.setItem("token", fakeToken);

    // get the last page (location) path before logout 
    const origin = location.state?.from?.pathname || "/dashboard";
    navigate(origin);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    // setToken(null);
    navigate("/home", { replace: true, state: { from: location } });
  };

  const value = {
    // token,
    onLogin: handleLogin,
    onLogout: handleLogout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

const PublicRoute = ({ redirectPath = "/dashboard", children }) => {
  const token = getToken();
  
  if (token) return <Navigate to={redirectPath} />;

  return children;
};

const ProtectedRoute = ({ redirectPath = "/home", children }) => {
  // let { token } = useAuth();
  // const location = useLocation();
  const token = getToken();

  if (!token) {
    // save the current location path (to be used when login to redirect to the last page before logout)
    // return <Navigate to="/home" replace state={{ from: location }} />;
    return <Navigate to={redirectPath} replace />;
  }

  return children ? children : <Outlet />;
}

function App() {
  const navigate = useNavigate();

  const [users, setUsers] = React.useState([
    { id: "1", fullName: "Bruce Lee" },
    { id: "2", fullName: "James Bond"},
  ]);

  const handleRemoveUser = (userId) => {
    setUsers((state) => (
      state.filter((user) => user.id !== userId)
    ));

    navigate("/users");
  }

  return (
    <AuthProvider>
      <div className="App">
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<PublicRoute><Home /></PublicRoute>} />
            <Route path="home" element={<PublicRoute><Home /></PublicRoute>} />
            {/* <Route 
              path="dashboard" 
              element={<ProtectedRoute><Dashboard /></ProtectedRoute> } 
            />
            <Route path="users" element={<ProtectedRoute><Users users={users} /></ProtectedRoute>}>
              <Route 
                path=":userId" 
                element={<User onRemoveUser={handleRemoveUser} />} 
              />
            </Route> */}
            <Route element={<ProtectedRoute />}>
              <Route 
                path="dashboard" 
                element={<Dashboard />} 
              />
              <Route path="users" element={<Users users={users} />}>
                <Route 
                  path=":userId" 
                  element={<User onRemoveUser={handleRemoveUser} />} 
                />
              </Route>
            </Route>
            <Route path="*" element={<NoMatch />} />
          </Route>
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
