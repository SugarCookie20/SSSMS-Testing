# SSSMS Academic Portal - Design System & UI/UX Standards
**Last Updated:** January 2026

---

## 1. Design Philosophy
The SSSMS Portal follows a clean, minimalist, and data-centric design philosophy. The interface is designed to be Mobile-First, ensuring functionality across devices without maintaining separate codebases.

### Core Principles
1.  **Clarity over Density:** White space is used generously to separate content areas.
2.  **Semantic Coloring:** Colors indicate role or status, never decoration.
3.  **Card-Based Layout:** All discrete information is grouped into contained cards.
4.  **Consistency:** Inputs, buttons, and typography must share identical classes across Admin, Faculty, and Student modules.

---

## 2. Foundations

### 2.1. Color Palette & Semantics
The application uses specific color themes to denote User Roles and System States. These must be adhered to strictly to maintain visual hierarchy.

#### Role-Based Themes
| Role | Primary Color | Tailwind Classes (Background / Text) | Usage Context |
| :--- | :--- | :--- | :--- |
| **Admin** | **Indigo** | `bg-indigo-50` / `text-indigo-600` | Sidebar icons, headers, primary buttons. |
| **Student** | **Blue** | `bg-blue-50` / `text-blue-600` | Student Dashboard, attendance stats. |
| **Faculty** | **Purple** | `bg-purple-50` / `text-purple-600` | Faculty Dashboard, assignment tools. |

#### System Status Colors
| State | Color | Usage |
| :--- | :--- | :--- |
| **Success** | **Green** | `bg-green-50 text-green-700 border-green-200` (Toasts, "Paid", "Present") |
| **Warning** | **Orange/Yellow** | `bg-orange-50 text-orange-700` (Notices, "Late") |
| **Error/Danger** | **Red** | `bg-red-50 text-red-700 border-red-200` (Delete actions, "Absent", Errors) |
| **Neutral** | **Gray** | `text-gray-500` (Secondary text), `border-gray-200` (Borders) |

### 2.2. Iconography
*   **Library:** `lucide-react`
*   **Style:** Icons are rarely used raw. They are almost always wrapped in a **Soft Container**.
*   **Implementation Pattern:**
    ```jsx
    // Standard Icon Container
    <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
      <IconName className="w-6 h-6" />
    </div>
    ```

---

## 3. Component Standards

### 3.1. Cards (The Main Container)
Every major piece of content (Forms, Lists, Stats) lives inside a standard card.
*   **Classes:** `bg-white rounded-xl border border-gray-200 shadow-sm`
*   **Hover Effect (Clickable Cards only):** `hover:shadow-md transition-shadow duration-200`

### 3.2. Buttons
Buttons must have consistent padding and corner rounding.

| Variant | Appearance | Classes |
| :--- | :--- | :--- |
| **Primary** | Solid Color | `bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 font-medium shadow-sm transition-colors` |
| **Secondary** | Outline/Ghost | `text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-lg font-medium transition-colors` |
| **Danger** | Icon/Text | `text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors` |
| **Disabled** | Faded | `disabled:opacity-50 disabled:cursor-not-allowed` |

### 3.3. Form Inputs
Inputs use a standardized height and focus ring to match the modern aesthetic.
*   **Standard Input:**
    ```jsx
    <input 
      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
    />
    ```
*   **Label:** Always `block text-sm font-medium text-gray-700 mb-1`.

### 3.4. Status Banner (Toast)
**Deprecated:** Native `window.alert()` and `window.confirm()`.
**Standard:** Inline status banners placed at the top of forms or tables.
*   **Structure:** Flex container with Icon (Check/X) + Message text.
*   **Behavior:** Auto-dismissal (3000ms) logic is handled by the parent component state.

---

## 4. Layout Architecture

### 4.1. The Shell (Sidebar & Main Content)
*   **Sidebar Width:** Fixed at `w-64`.
*   **Desktop:** Sidebar is `fixed inset-y-0`. Main content has `ml-64`.
*   **Mobile:** Sidebar is hidden by default (`-translate-x-full`). A hamburger menu toggles `translate-x-0`.
*   **Navigation Links:**
    *   Active: `bg-blue-50 text-blue-700`
    *   Inactive: `text-gray-600 hover:bg-gray-50`

### 4.2. Page Container
All page content **must** be wrapped in a specific max-width container to prevent stretching on large screens.
```jsx
<div className="max-w-7xl mx-auto">
   {/* Page Content */}
</div>
```

---

## 5. Responsive Data Tables
Tables are the most complex UI element to handle responsively.
**Strict Rule:** All tables must be wrapped in a container that allows horizontal scrolling. Failure to do this breaks the mobile view.

**Required Structure:**
```jsx
<div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
    {/* SCROLL WRAPPER */}
    <div className="overflow-x-auto"> 
        <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-200 uppercase tracking-wider font-semibold text-gray-500">
                {/* Headers */}
            </thead>
            <tbody className="divide-y divide-gray-100">
                {/* Rows */}
            </tbody>
        </table>
    </div>
</div>
```
*   `whitespace-nowrap`: Prevents cell content from wrapping awkwardly.
*   `overflow-x-auto`: Adds a scrollbar only when needed on small screens.

---

## 6. Grid Systems
Dashboards and Forms use CSS Grids for layout.

*   **Dashboard Cards:**
    `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
    *   *Result:* 1 column on Mobile, 2 on Tablet, 3 on Desktop.

*   **Form Fields:**
    `grid grid-cols-1 md:grid-cols-2 gap-4`
    *   *Result:* Stacked inputs on Mobile, side-by-side on Desktop.

---

## 7. Interaction States

### 7.1. Loading State
**Never** leave a blank screen while data fetches.
*   **Pattern:**
    ```jsx
    if (loading) return <div className="p-8 text-center text-gray-500">Loading data...</div>;
    ```
*   **Button Loading:** When submitting a form, the button must show "Processing..." and be `disabled`.

### 7.2. Empty State
When a list (e.g., Notices, Allocations) is empty, do not show an empty table. Show a descriptive placeholder.
*   **Pattern:**
    ```jsx
    <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-xl">
        <p className="text-gray-500">No records found.</p>
    </div>
    ```

---

## 8. CSS Utility Classes 

| UI Element | CSS Classes |
| :--- | :--- |
| **Page Header** | `text-3xl font-bold text-gray-900 mb-2` |
| **Section Header** | `text-xl font-bold text-gray-900 mb-4` |
| **Subtext** | `text-sm text-gray-500` |
| **Card Border** | `border border-gray-200` |
| **Shadow** | `shadow-sm` (Standard), `shadow-lg` (Hover/Modal) |
| **Avatar Circle** | `w-10 h-10 rounded-full flex items-center justify-center` |
| **Modal Overlay** | `fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50` |