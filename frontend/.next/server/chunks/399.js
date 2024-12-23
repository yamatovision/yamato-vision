exports.id = 399;
exports.ids = [399];
exports.modules = {

/***/ 9636:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

Promise.resolve(/* import() eager */).then(__webpack_require__.bind(__webpack_require__, 5025))

/***/ }),

/***/ 5025:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ UserLayout)
});

// EXTERNAL MODULE: external "next/dist/compiled/react/jsx-runtime"
var jsx_runtime_ = __webpack_require__(6786);
// EXTERNAL MODULE: ./src/contexts/theme.tsx
var contexts_theme = __webpack_require__(1474);
// EXTERNAL MODULE: ./src/lib/hooks/useAuth.ts
var useAuth = __webpack_require__(786);
// EXTERNAL MODULE: ./node_modules/next/navigation.js
var navigation = __webpack_require__(7114);
// EXTERNAL MODULE: external "next/dist/compiled/react"
var react_ = __webpack_require__(8038);
// EXTERNAL MODULE: ./node_modules/next/link.js
var next_link = __webpack_require__(1440);
var link_default = /*#__PURE__*/__webpack_require__.n(next_link);
;// CONCATENATED MODULE: ./src/app/user/shared/BottomNavigation.tsx
/* __next_internal_client_entry_do_not_use__ BottomNavigation auto */ 



function BottomNavigation() {
    const { theme, toggleTheme } = (0,contexts_theme.useTheme)();
    const pathname = (0,navigation.usePathname)();
    const navItems = [
        {
            icon: "\uD83C\uDFE0",
            href: "/user/home",
            label: "ホーム"
        },
        {
            icon: "\uD83D\uDCDA",
            href: "/user/courses",
            label: "コース"
        },
        {
            icon: "\uD83C\uDFC6",
            href: "/user/ranking",
            label: "ランキング"
        },
        {
            icon: "\uD83D\uDCAD",
            href: "/user/forum",
            label: "フォーラム"
        },
        {
            icon: "\uD83D\uDECD️",
            href: "/user/shop",
            label: "ショップ"
        }
    ];
    const baseClasses = theme === "dark" ? "fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700" : "fixed bottom-0 left-0 right-0 bg-white border-t border-[#DBEAFE] shadow-lg";
    return /*#__PURE__*/ jsx_runtime_.jsx("nav", {
        className: baseClasses,
        children: /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
            className: "max-w-2xl mx-auto flex justify-between items-center p-4",
            children: [
                navItems.map((item)=>/*#__PURE__*/ jsx_runtime_.jsx((link_default()), {
                        href: item.href,
                        className: `text-2xl ${pathname === item.href ? theme === "dark" ? "text-blue-400" : "text-[#3B82F6]" : theme === "dark" ? "text-gray-400" : "text-gray-600"} hover:opacity-80 transition-opacity`,
                        children: /*#__PURE__*/ jsx_runtime_.jsx("span", {
                            role: "img",
                            "aria-label": item.label,
                            children: item.icon
                        })
                    }, item.href)),
                /*#__PURE__*/ jsx_runtime_.jsx("button", {
                    onClick: toggleTheme,
                    className: `text-2xl ${theme === "dark" ? "text-gray-400" : "text-gray-600"} hover:opacity-80 transition-opacity`,
                    children: theme === "dark" ? "\uD83C\uDF19" : "☀️"
                })
            ]
        })
    });
}

;// CONCATENATED MODULE: ./src/app/user/layout.tsx
/* __next_internal_client_entry_do_not_use__ default auto */ 





function UserLayout({ children }) {
    const { theme } = (0,contexts_theme.useTheme)();
    const { user } = (0,useAuth/* useAuth */.a)();
    const router = (0,navigation.useRouter)();
    (0,react_.useEffect)(()=>{
        if (!user) {
            router.push("/login");
        } else if (user.rank === "退会者") {
            router.push("/login");
        }
    }, [
        user
    ]);
    if (!user || user.rank === "退会者") return null;
    return /*#__PURE__*/ (0,jsx_runtime_.jsxs)("div", {
        className: `min-h-screen pb-20 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-[#F8FAFC] text-[#1E40AF]"}`,
        children: [
            /*#__PURE__*/ jsx_runtime_.jsx("main", {
                className: "max-w-7xl mx-auto px-4",
                children: children
            }),
            /*#__PURE__*/ jsx_runtime_.jsx(BottomNavigation, {})
        ]
    });
}


/***/ }),

/***/ 3047:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   $$typeof: () => (/* binding */ $$typeof),
/* harmony export */   __esModule: () => (/* binding */ __esModule),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var next_dist_build_webpack_loaders_next_flight_loader_module_proxy__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1363);

const proxy = (0,next_dist_build_webpack_loaders_next_flight_loader_module_proxy__WEBPACK_IMPORTED_MODULE_0__.createProxy)(String.raw`/Users/tatsuyashiraishi/Desktop/yamato-vision/frontend/src/app/user/layout.tsx`)

// Accessing the __esModule property and exporting $$typeof are required here.
// The __esModule getter forces the proxy target to create the default export
// and the $$typeof value is for rendering logic to determine if the module
// is a client boundary.
const { __esModule, $$typeof } = proxy;
const __default__ = proxy.default;


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__default__);

/***/ })

};
;