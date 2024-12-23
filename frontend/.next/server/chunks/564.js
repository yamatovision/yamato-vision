exports.id = 564;
exports.ids = [564];
exports.modules = {

/***/ 6638:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

Promise.resolve(/* import() eager */).then(__webpack_require__.t.bind(__webpack_require__, 1232, 23));
Promise.resolve(/* import() eager */).then(__webpack_require__.t.bind(__webpack_require__, 2987, 23));
Promise.resolve(/* import() eager */).then(__webpack_require__.t.bind(__webpack_require__, 831, 23));
Promise.resolve(/* import() eager */).then(__webpack_require__.t.bind(__webpack_require__, 6926, 23));
Promise.resolve(/* import() eager */).then(__webpack_require__.t.bind(__webpack_require__, 4282, 23));
Promise.resolve(/* import() eager */).then(__webpack_require__.t.bind(__webpack_require__, 6505, 23))

/***/ }),

/***/ 4240:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

Promise.resolve(/* import() eager */).then(__webpack_require__.bind(__webpack_require__, 764));
Promise.resolve(/* import() eager */).then(__webpack_require__.bind(__webpack_require__, 1474));
Promise.resolve(/* import() eager */).then(__webpack_require__.bind(__webpack_require__, 6487))

/***/ }),

/***/ 764:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AuthProvider: () => (/* binding */ AuthProvider)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6786);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(8038);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _lib_hooks_useAuth__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(786);
/* __next_internal_client_entry_do_not_use__ AuthProvider auto */ 


function AuthProvider({ children }) {
    const { login, logout, initialized, setInitialized } = (0,_lib_hooks_useAuth__WEBPACK_IMPORTED_MODULE_2__/* .useAuth */ .a)();
    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{
        const initAuth = async ()=>{
            const token = localStorage.getItem("auth_token");
            if (token) {
                try {
                    const success = await login(token);
                    if (!success) {
                        logout();
                    }
                } catch  {
                    logout();
                }
            }
            setInitialized(true);
        };
        initAuth();
    }, [
        login,
        logout,
        setInitialized
    ]);
    if (!initialized) {
        return null; // または適切なローディング表示
    }
    return /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, {
        children: children
    });
}


/***/ }),

/***/ 1474:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ThemeProvider: () => (/* binding */ ThemeProvider),
/* harmony export */   useTheme: () => (/* binding */ useTheme)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6786);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(8038);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* __next_internal_client_entry_do_not_use__ ThemeProvider,useTheme auto */ 

const ThemeContext = /*#__PURE__*/ (0,react__WEBPACK_IMPORTED_MODULE_1__.createContext)({
    theme: "light",
    device: "desktop",
    toggleTheme: ()=>{}
});
function ThemeProvider({ children }) {
    const [theme, setTheme] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)("light");
    const [device, setDevice] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)("desktop");
    const [mounted, setMounted] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{
        setMounted(true);
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) {
            setTheme(savedTheme);
            document.documentElement.className = savedTheme;
        }
        const handleResize = ()=>{
            setDevice(window.innerWidth < 768 ? "mobile" : "desktop");
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return ()=>window.removeEventListener("resize", handleResize);
    }, []);
    const toggleTheme = ()=>{
        const newTheme = theme === "dark" ? "light" : "dark";
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
        document.documentElement.className = newTheme;
    };
    if (!mounted) {
        return null;
    }
    return /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(ThemeContext.Provider, {
        value: {
            theme,
            device,
            toggleTheme
        },
        children: children
    });
}
function useTheme() {
    const context = (0,react__WEBPACK_IMPORTED_MODULE_1__.useContext)(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}


/***/ }),

/***/ 6487:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  ToastProvider: () => (/* binding */ ToastProvider),
  useToast: () => (/* binding */ useToast)
});

// EXTERNAL MODULE: external "next/dist/compiled/react/jsx-runtime"
var jsx_runtime_ = __webpack_require__(6786);
// EXTERNAL MODULE: external "next/dist/compiled/react"
var react_ = __webpack_require__(8038);
;// CONCATENATED MODULE: ./src/app/user/shared/Toast.tsx
// frontend/src/app/user/shared/Toast.tsx
/* __next_internal_client_entry_do_not_use__ Toast auto */ 
function Toast({ message, type, onClose, levelUpData }) {
    const baseStyle = "p-4 rounded-md shadow-lg flex items-center justify-between";
    const typeStyles = {
        success: "bg-green-500 text-white",
        error: "bg-red-500 text-white",
        info: "bg-blue-500 text-white",
        warning: "bg-yellow-500 text-white",
        levelUp: "bg-gradient-to-r from-yellow-600 to-yellow-400 text-white"
    };
    if (type === "levelUp" && levelUpData) {
        return /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
            className: "fixed inset-0 flex items-center justify-center z-50",
            onClick: onClose,
            children: [
                /*#__PURE__*/ jsx_runtime_.jsx("div", {
                    className: "absolute inset-0 bg-black bg-opacity-50"
                }),
                /*#__PURE__*/ jsx_runtime_.jsx("div", {
                    className: `${baseStyle} ${typeStyles[type]} transform transition-all duration-300 scale-100 hover:scale-105`,
                    children: /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                        className: "text-center w-full",
                        children: [
                            /*#__PURE__*/ jsx_runtime_.jsx("div", {
                                className: "text-4xl font-bold mb-4",
                                children: "\uD83C\uDF8A Level Up! \uD83C\uDF8A"
                            }),
                            /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                                className: "text-5xl font-bold mb-4",
                                children: [
                                    "Lv.",
                                    levelUpData.newLevel
                                ]
                            }),
                            levelUpData.specialUnlock ? /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
                                className: "text-lg bg-yellow-700 rounded-lg p-3 mt-4 mb-4",
                                children: [
                                    "\uD83C\uDF89 ",
                                    levelUpData.specialUnlock,
                                    " \uD83C\uDF89"
                                ]
                            }) : /*#__PURE__*/ jsx_runtime_.jsx("div", {
                                className: "text-lg bg-yellow-700 rounded-lg p-3 mt-4 mb-4",
                                children: "\uD83C\uDF89 おめでとうございます！！ \uD83C\uDF89"
                            }),
                            /*#__PURE__*/ jsx_runtime_.jsx("div", {
                                className: "text-sm text-yellow-100 mt-4",
                                children: "クリックして閉じる"
                            })
                        ]
                    })
                })
            ]
        });
    }
    return /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
        className: `${baseStyle} ${typeStyles[type]}`,
        children: [
            /*#__PURE__*/ jsx_runtime_.jsx("span", {
                children: message
            }),
            /*#__PURE__*/ jsx_runtime_.jsx("button", {
                onClick: onClose,
                className: "ml-4 text-white hover:text-gray-200",
                children: "\xd7"
            })
        ]
    });
}

;// CONCATENATED MODULE: ./src/contexts/toast.tsx
// frontend/src/contexts/toast.tsx
/* __next_internal_client_entry_do_not_use__ ToastProvider,useToast auto */ 


const ToastContext = /*#__PURE__*/ (0,react_.createContext)(undefined);
function ToastProvider({ children }) {
    const [toasts, setToasts] = (0,react_.useState)([]);
    const showToast = (message, type, levelUpData)=>{
        const id = Date.now();
        setToasts((prev)=>[
                ...prev,
                {
                    id,
                    message,
                    type,
                    levelUpData
                }
            ]);
        // レベルアップ通知の場合は自動で消えないようにする
        if (type !== "levelUp") {
            setTimeout(()=>{
                setToasts((prev)=>prev.filter((toast)=>toast.id !== id));
            }, 3000);
        }
    };
    return /*#__PURE__*/ (0,jsx_runtime_.jsxs)(ToastContext.Provider, {
        value: {
            showToast
        },
        children: [
            children,
            /*#__PURE__*/ jsx_runtime_.jsx("div", {
                className: "fixed bottom-4 right-4 z-50 space-y-2",
                children: toasts.map((toast)=>/*#__PURE__*/ jsx_runtime_.jsx(Toast, {
                        message: toast.message,
                        type: toast.type,
                        levelUpData: toast.levelUpData,
                        onClose: ()=>setToasts((prev)=>prev.filter((t)=>t.id !== toast.id))
                    }, toast.id))
            })
        ]
    });
}
function useToast() {
    const context = (0,react_.useContext)(ToastContext);
    if (context === undefined) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}


/***/ }),

/***/ 203:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Z: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1145);

const API_URL = "http://localhost:3001/api" || 0;
const api = axios__WEBPACK_IMPORTED_MODULE_0__/* ["default"] */ .Z.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json"
    }
});
// リクエストインターセプター
api.interceptors.request.use((config)=>{
    const token = localStorage.getItem("auth_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
// レスポンスインターセプター
api.interceptors.response.use((response)=>response, async (error)=>{
    // 認証エラーの場合
    if (error.response?.status === 401) {
        localStorage.removeItem("auth_token");
        // 現在のパスがログインページでない場合のみリダイレクト
        const currentPath = window.location.pathname;
        if (currentPath !== "/login" && currentPath !== "/") {
            window.location.href = "/login";
        }
    }
    return Promise.reject(error);
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (api);


/***/ }),

/***/ 786:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   a: () => (/* binding */ useAuth)
/* harmony export */ });
/* harmony import */ var zustand__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(8944);
/* harmony import */ var _lib_api_auth__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(203);


const isValidUserRank = (rank)=>{
    const validRanks = [
        "お試し",
        "退会者",
        "初伝",
        "中伝",
        "奥伝",
        "皆伝",
        "管理者"
    ];
    return validRanks.includes(rank);
};
const validateUser = (user)=>{
    if (!user.rank || !isValidUserRank(user.rank)) {
        throw new Error("Invalid user rank");
    }
    return {
        id: user.id,
        email: user.email,
        name: user.name,
        rank: user.rank,
        mongoId: user.mongoId
    };
};
const useAuth = (0,zustand__WEBPACK_IMPORTED_MODULE_1__/* .create */ .U)((set)=>({
        user: null,
        loading: false,
        error: null,
        initialized: false,
        login: async (emailOrToken, password)=>{
            set({
                loading: true,
                error: null
            });
            try {
                let response;
                if (password) {
                    response = await _lib_api_auth__WEBPACK_IMPORTED_MODULE_0__/* ["default"] */ .Z.post("/auth/login", {
                        email: emailOrToken,
                        password
                    });
                } else {
                    response = await _lib_api_auth__WEBPACK_IMPORTED_MODULE_0__/* ["default"] */ .Z.get("/auth/verify", {
                        headers: {
                            Authorization: `Bearer ${emailOrToken}`
                        }
                    });
                }
                const { success, token, user: rawUser } = response.data;
                if (success && token && rawUser) {
                    const validatedUser = validateUser(rawUser);
                    localStorage.setItem("auth_token", token);
                    set({
                        user: validatedUser,
                        loading: false,
                        error: null
                    });
                    return true;
                }
                set({
                    error: response.data.message || "認証に失敗しました",
                    loading: false
                });
                return false;
            } catch (error) {
                localStorage.removeItem("auth_token");
                set({
                    user: null,
                    error: "認証に失敗しました",
                    loading: false
                });
                return false;
            }
        },
        logout: ()=>{
            localStorage.removeItem("auth_token");
            set({
                user: null,
                loading: false,
                error: null
            });
        },
        setInitialized: (state)=>set({
                initialized: state
            })
    }));


/***/ }),

/***/ 3669:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ RootLayout)
});

// EXTERNAL MODULE: external "next/dist/compiled/react/jsx-runtime"
var jsx_runtime_ = __webpack_require__(6786);
// EXTERNAL MODULE: ./node_modules/next/dist/build/webpack/loaders/next-flight-loader/module-proxy.js
var module_proxy = __webpack_require__(1363);
;// CONCATENATED MODULE: ./src/contexts/AuthProvider.tsx

const proxy = (0,module_proxy.createProxy)(String.raw`/Users/tatsuyashiraishi/Desktop/yamato-vision/frontend/src/contexts/AuthProvider.tsx`)

// Accessing the __esModule property and exporting $$typeof are required here.
// The __esModule getter forces the proxy target to create the default export
// and the $$typeof value is for rendering logic to determine if the module
// is a client boundary.
const { __esModule, $$typeof } = proxy;
const __default__ = proxy.default;

const e0 = proxy["AuthProvider"];

;// CONCATENATED MODULE: ./src/contexts/theme.tsx

const theme_proxy = (0,module_proxy.createProxy)(String.raw`/Users/tatsuyashiraishi/Desktop/yamato-vision/frontend/src/contexts/theme.tsx`)

// Accessing the __esModule property and exporting $$typeof are required here.
// The __esModule getter forces the proxy target to create the default export
// and the $$typeof value is for rendering logic to determine if the module
// is a client boundary.
const { __esModule: theme_esModule, $$typeof: theme_$$typeof } = theme_proxy;
const theme_default_ = theme_proxy.default;

const theme_e0 = theme_proxy["ThemeProvider"];

const e1 = theme_proxy["useTheme"];

;// CONCATENATED MODULE: ./src/contexts/toast.tsx

const toast_proxy = (0,module_proxy.createProxy)(String.raw`/Users/tatsuyashiraishi/Desktop/yamato-vision/frontend/src/contexts/toast.tsx`)

// Accessing the __esModule property and exporting $$typeof are required here.
// The __esModule getter forces the proxy target to create the default export
// and the $$typeof value is for rendering logic to determine if the module
// is a client boundary.
const { __esModule: toast_esModule, $$typeof: toast_$$typeof } = toast_proxy;
const toast_default_ = toast_proxy.default;

const toast_e0 = toast_proxy["ToastProvider"];

const toast_e1 = toast_proxy["useToast"];

// EXTERNAL MODULE: ./src/styles/globals.css
var globals = __webpack_require__(4315);
;// CONCATENATED MODULE: ./src/app/layout.tsx

 // ファイル名を正しく参照



function RootLayout({ children }) {
    return /*#__PURE__*/ jsx_runtime_.jsx("html", {
        lang: "ja",
        children: /*#__PURE__*/ jsx_runtime_.jsx("body", {
            children: /*#__PURE__*/ jsx_runtime_.jsx(e0, {
                children: /*#__PURE__*/ jsx_runtime_.jsx(theme_e0, {
                    children: /*#__PURE__*/ jsx_runtime_.jsx(toast_e0, {
                        children: children
                    })
                })
            })
        })
    });
}


/***/ }),

/***/ 4315:
/***/ (() => {



/***/ })

};
;