# Taskman Pagination, Sorting, and Filtering Plan

## Goals
- Make it easy to **find the right tasks fast**.
- Keep the UI simple on mobile.
- Ensure every view is **shareable/bookmarkable** (URL reflects filters).

---

## Pagination
**What it does**
- Split the tasks list into pages so large lists stay fast and scannable.

**UX**
- Controls at the bottom (and optionally top):  
  - “Previous” / “Next” buttons  
  - “Page X of Y” text  
  - Optional page-size selector: 10 / 20 / 50 per page
- On mobile, keep only “Previous” / “Next” and the page text.

**Behavior**
- Default: page 1, 10 per page
- URL: `?page=2&limit=20`
- Show an **empty state** if there are no tasks on the current page (with a “Clear filters” button visible if filters are active).

**Acceptance criteria**
- List shows the correct number per page.
- Buttons disable at first/last page.
- Changing page size resets to page 1.

---

## Sorting
**What it does**
- Order tasks by the user’s preference.

**Sort options (sane defaults)**
- **Newest first** (default): createdAt ↓
- **Oldest first**: createdAt ↑
- **Due date**: dueDate ↑ (soonest first)
- **Priority**: High → Medium → Low (special business order)
- **Status**: Pending → In Progress → Completed (optional)

**UX**
- A compact **“Sort by”** dropdown above the list.
- On mobile, it’s a single-select dropdown.

**Behavior**
- URL: `?sort=-createdAt` or `?sort=dueDate` or `?sort=-priority`  
  (use `-` for descending)
- If combining sorts, allow: `?sort=dueDate,-priority` (due date first, break ties by priority).

**Acceptance criteria**
- Sorting applies consistently with the chosen order.
- Priority respects the business order (not alphabetical).

---

## Filters
**What it does**
- Narrow down results by attributes.

**Filter types**
1. **Status** (multi-select): Pending, In Progress, Completed  
   - URL: `?status=Pending,In%20Progress`
2. **Labels** (multi-select chips): Work, Home, “code review”, etc.  
   - URL: `?labels=Work,Home`  
   - **Any-match** logic: a task appears if it has at least one selected label.
3. **Priority** (multi-select): Low, Medium, High  
   - URL: `?priority=High,Medium` (optional, but useful)
4. **Due date range**: from/to picker  
   - URL: `?dueFrom=2025-08-01&dueTo=2025-08-31`
5. **Search** (free text): matches task title & description  
   - URL: `?q=proposal`

**Labels UX (nice & powerful)**
- At the top of the page, show a **“Your labels”** section with chips for labels the user has used across all tasks.
- Clicking a chip:
  - toggles it on/off as a filter
  - updates URL (`?labels=Design,Review`)
  - shows a small “Filters active” pill near the title
- Add a compact “Clear filters” button when anything is active.

**Combined behavior**
- All filters can be combined:  
  `?status=Pending&labels=Work,Review&q=report&dueFrom=2025-08-01&sort=dueDate`
- Pagination respects the filtered result set.
- Changing filters resets to page 1.

**Acceptance criteria**
- Every filter updates the URL.
- Refreshing or sharing the URL reproduces the same view.
- Multi-select chips behave correctly (toggle on/off).
- Clear button removes all filters and resets sorting/pagination to defaults.

---

## Status/Ownership
- The list **only shows tasks created by the logged-in user** (your secure default).
- If the user role is `admin/publisher`, optionally allow a toggle “Show all users’ tasks” (admin-only view).  
  - URL could include `?scope=all` for admins.

---

## Defaults & Presets
- **Default view** (first-time user):  
  - sort: `Newest first`  
  - page: 1, limit: 10  
  - filters: none
- Remember the user’s **last selection** in the URL (so history works).
- Optional: add one-click **“My open tasks”** preset → `status=Pending,In%20Progress&sort=dueDate`.

---

## Feedback & Empty States
- If no tasks match filters:  
  - Show “No tasks match your filters” + button: “Clear filters”.
- If search returns nothing:  
  - Show “No results for ‘keyword’” and a hint like “Try fewer filters”.

---

## Mobile UX
- Filters & sort collapsed into a **“Filters” sheet** (bottom drawer or modal).
- Show the **active filter count** on the Filters button (e.g., Filters (3)).
- Keep pagination buttons large and thumb-friendly.

---

## Performance & Scale
- Apply **server-side filtering/sorting/pagination** (you already do most of this).
- Add indexes for:
  - `{ user: 1, createdAt: -1 }`
  - `{ user: 1, dueDate: 1 }`
  - `{ user: 1, status: 1 }`
  - `{ labels: 1 }`
- If you add full-text search later, create a text index on `task` & `description`.

---

## Examples (URL patterns to support)
- Page 2, 20 per page, due date asc:  
  `/tasks?page=2&limit=20&sort=dueDate`
- Show only Pending/In Progress, labels Work or Home:  
  `/tasks?status=Pending,In%20Progress&labels=Work,Home`
- Search “proposal” due this month, priority High first:  
  `/tasks?q=proposal&dueFrom=2025-08-01&dueTo=2025-08-31&sort=-priority`
- Admin viewing all users:  
  `/tasks?scope=all&sort=-createdAt`

---

## “Done” checklist (for you)
- [ ] Pagination controls + page-size selector
- [ ] Sort dropdown (default newest first; priority business order)
- [ ] Filter bar (status, labels, priority, date range, search)
- [ ] Labels chips from **only this user’s** historical labels
- [ ] Clear filters button appears when any filter active
- [ ] URL reflects state; reloading restores the same view
- [ ] Mobile filter sheet with active count
- [ ] Empty states with “Clear filters” CTA
- [ ] Backend enforces owner-only unless admin
- [ ] DB indexes added for user/filters/sorts
