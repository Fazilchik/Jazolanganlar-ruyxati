// ======================================================
// SUPABASE
// ======================================================

const SUPABASE_URL =
    "https://ksakrfzasajcoffywpcj.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_9vA0Q0ZbUrGZvbpuye56nQ_lGgB8jcg";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


// ======================================================
// GLOBAL
// ======================================================

let punishments = [];


// ======================================================
// PAGE
// ======================================================

function showPage(pageId) {

    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });

    document.getElementById(pageId).classList.add("active");
}


// ======================================================
// LOGIN
// ======================================================

async function loginAdmin(event) {

    event.preventDefault();

    const username =
        document.getElementById("loginUsername").value.trim();

    const password =
        document.getElementById("loginPassword").value;

    const error =
        document.getElementById("loginError");

    error.textContent = "";

    // Foydalanuvchi username orqali kiradi.
    // Supabase Auth ichida esa email ishlatiladi.
    if (username !== "Fazilchik") {

        error.textContent =
            "Username yoki parol noto‘g‘ri.";

        return;
    }

    const email = "fazilchik@mcmodhub.local";

    const { data, error: loginError } =
        await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });

    if (loginError) {

        error.textContent =
            "Username yoki parol noto‘g‘ri.";

        return;
    }

    if (data.session) {

        document.getElementById("loginUsername").value = "";
        document.getElementById("loginPassword").value = "";

        showPage("adminPage");

        await loadPunishments();
    }
}


// ======================================================
// LOGOUT
// ======================================================

async function logoutAdmin() {

    await supabaseClient.auth.signOut();

    showPage("userPage");

    await loadPunishments();
}


// ======================================================
// LOAD DATA
// ======================================================

async function loadPunishments() {

    const { data, error } =
        await supabaseClient
            .from("punishments")
            .select("*")
            .order("issued_at", {
                ascending: false
            });

    if (error) {

        console.error(error);

        alert(
            "Ma'lumotlarni yuklashda xatolik yuz berdi."
        );

        return;
    }

    punishments = data || [];

    // Muddati tugagan jazolarni statusini expired qilamiz.
    await expirePunishments();

    // Yangilangan ma'lumotlarni qayta olish
    const { data: freshData } =
        await supabaseClient
            .from("punishments")
            .select("*")
            .order("issued_at", {
                ascending: false
            });

    punishments = freshData || [];

    renderUserTable();

    renderAdminTable();

    updateStats();

    updateWarningAlert();
}


// ======================================================
// EXPIRE PUNISHMENTS
// ======================================================

async function expirePunishments() {

    const now = new Date();

    const expiredIds = punishments
        .filter(item => {

            if (!item.expires_at) {
                return false;
            }

            if (item.status !== "active") {
                return false;
            }

            return new Date(item.expires_at) <= now;

        })
        .map(item => item.id);

    if (expiredIds.length === 0) {
        return;
    }

    for (const id of expiredIds) {

        await supabaseClient
            .from("punishments")
            .update({
                status: "expired"
            })
            .eq("id", id);
    }
}


// ======================================================
// ACTIVE PUNISHMENTS
// ======================================================

function getActivePunishments() {

    const now = new Date();

    return punishments.filter(item => {

        if (item.status !== "active") {
            return false;
        }

        if (
            item.expires_at &&
            new Date(item.expires_at) <= now
        ) {
            return false;
        }

        return true;
    });
}


// ======================================================
// DATE
// ======================================================

function formatDate(date) {

    if (!date) {
        return "-";
    }

    return new Date(date).toLocaleString(
        "uz-UZ",
        {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// ======================================================
// PUNISHMENT COUNT
// ======================================================

function getPunishmentCount(username) {

    return punishments.filter(item =>

        item.username.toLowerCase() ===
        username.toLowerCase()

    ).length;
}


// ======================================================
// USER TABLE
// ======================================================

function renderUserTable() {

    const tbody =
        document.getElementById("userTableBody");

    const empty =
        document.getElementById("emptyMessage");

    const search =
        document.getElementById("searchInput")
            .value
            .toLowerCase()
            .trim();

    const active =
        getActivePunishments();

    const filtered =
        active.filter(item => {

            return (
                item.username
                    .toLowerCase()
                    .includes(search)

                ||

                item.reason
                    .toLowerCase()
                    .includes(search)

                ||

                item.punishment_type
                    .toLowerCase()
                    .includes(search)
            );
        });

    tbody.innerHTML = "";

    if (filtered.length === 0) {

        empty.style.display = "block";

        return;

    } else {

        empty.style.display = "none";
    }


    filtered.forEach(item => {

        const count =
            getPunishmentCount(item.username);

        const row =
            document.createElement("tr");

        row.innerHTML = `

            <td>
                <b>${escapeHTML(item.username)}</b>
            </td>

            <td>
                ${escapeHTML(item.reason)}
            </td>

            <td>
                ${getStatusHTML(item.punishment_type)}
            </td>

            <td>
                ${escapeHTML(item.duration || "Doimiy")}
            </td>

            <td>
                ${escapeHTML(item.moderator)}
            </td>

            <td>
                ${count} marta
            </td>

            <td>
                ${formatDate(item.issued_at)}
            </td>

            <td>
                <span class="status status-${getStatusClass(item.punishment_type)}">
                    Faol
                </span>
            </td>

        `;

        tbody.appendChild(row);

    });
}


// ======================================================
// STATUS HTML
// ======================================================

function getStatusHTML(type) {

    let className =
        getStatusClass(type);

    return `
        <span class="status status-${className}">
            ${escapeHTML(type)}
        </span>
    `;
}


function getStatusClass(type) {

    if (type === "Ban") {
        return "ban";
    }

    if (type.includes("Mute")) {
        return "mute";
    }

    return "warning";
}


// ======================================================
// ADMIN TABLE
// ======================================================

function renderAdminTable() {

    const tbody =
        document.getElementById("adminTableBody");

    const searchInput =
        document.getElementById("adminSearch");

    if (!tbody || !searchInput) {
        return;
    }

    const search =
        searchInput.value
            .toLowerCase()
            .trim();

    const active =
        getActivePunishments();

    const filtered =
        active.filter(item => {

            return (
                item.username
                    .toLowerCase()
                    .includes(search)

                ||

                item.reason
                    .toLowerCase()
                    .includes(search)

                ||

                item.punishment_type
                    .toLowerCase()
                    .includes(search)

                ||

                item.moderator
                    .toLowerCase()
                    .includes(search)
            );
        });

    tbody.innerHTML = "";

    filtered.forEach(item => {

        const count =
            getPunishmentCount(item.username);

        const row =
            document.createElement("tr");

        row.innerHTML = `

            <td>
                <b>${escapeHTML(item.username)}</b>
            </td>

            <td>
                ${escapeHTML(item.reason)}
            </td>

            <td>
                ${getStatusHTML(item.punishment_type)}
            </td>

            <td>
                ${escapeHTML(item.duration || "Doimiy")}
            </td>

            <td>
                ${escapeHTML(item.moderator)}
            </td>

            <td>
                ${count} marta
            </td>

            <td>
                ${formatDate(item.issued_at)}
            </td>

            <td>

                <div class="action-buttons">

                    <button
                        class="edit-btn"
                        onclick="editPunishment('${item.id}')"
                    >
                        Tahrirlash
                    </button>

                    <button
                        class="delete-btn"
                        onclick="deletePunishment('${item.id}')"
                    >
                        Bekor qilish
                    </button>

                </div>

            </td>

        `;

        tbody.appendChild(row);
    });
}


// ======================================================
// DURATION
// ======================================================

function updateDuration() {

    const type =
        document.getElementById("punishmentType").value;

    const duration =
        document.getElementById("duration");

    if (type === "Mute 1 soat") {
        duration.value = "1 soat";
    }

    else if (type === "Mute 6 soat") {
        duration.value = "6 soat";
    }

    else if (type === "Mute 12 soat") {
        duration.value = "12 soat";
    }

    else if (type === "Mute 24 soat") {
        duration.value = "24 soat";
    }

    else {
        duration.value = "Doimiy";
    }
}


// ======================================================
// EXPIRATION TIME
// ======================================================

function getExpiration(type, issuedAt) {

    const date =
        new Date(issuedAt);

    if (type === "Mute 1 soat") {

        date.setHours(
            date.getHours() + 1
        );

        return date.toISOString();
    }

    if (type === "Mute 6 soat") {

        date.setHours(
            date.getHours() + 6
        );

        return date.toISOString();
    }

    if (type === "Mute 12 soat") {

        date.setHours(
            date.getHours() + 12
        );

        return date.toISOString();
    }

    if (type === "Mute 24 soat") {

        date.setHours(
            date.getHours() + 24
        );

        return date.toISOString();
    }

    return null;
}


// ======================================================
// ADD / EDIT
// ======================================================

async function savePunishment(event) {

    event.preventDefault();

    const id =
        document.getElementById("editId").value;

    const username =
        document.getElementById("username")
            .value
            .trim();

    const reason =
        document.getElementById("reason")
            .value
            .trim();

    const type =
        document.getElementById("punishmentType")
            .value;

    const duration =
        document.getElementById("duration")
            .value;

    const moderator =
        document.getElementById("moderator")
            .value
            .trim();


    if (!username || !reason || !moderator) {

        alert("Barcha maydonlarni to‘ldiring.");

        return;
    }


    // EDIT
    if (id) {

        const oldItem =
            punishments.find(
                item => item.id === id
            );

        const issuedAt =
            oldItem?.issued_at ||
            new Date().toISOString();

        const expiresAt =
            getExpiration(
                type,
                issuedAt
            );

        const { error } =
            await supabaseClient
                .from("punishments")
                .update({

                    username: username,

                    reason: reason,

                    punishment_type: type,

                    duration: duration,

                    moderator: moderator,

                    expires_at: expiresAt,

                    status: "active"

                })
                .eq("id", id);


        if (error) {

            console.error(error);

            alert(
                "Tahrirlashda xatolik yuz berdi."
            );

            return;
        }

    }

    // ADD
    else {

        const issuedAt =
            new Date().toISOString();

        const expiresAt =
            getExpiration(
                type,
                issuedAt
            );


        const { error } =
            await supabaseClient
                .from("punishments")
                .insert({

                    username: username,

                    reason: reason,

                    punishment_type: type,

                    duration: duration,

                    moderator: moderator,

                    issued_at: issuedAt,

                    expires_at: expiresAt,

                    status: "active"

                });


        if (error) {

            console.error(error);

            alert(
                "Jazo qo‘shishda xatolik yuz berdi."
            );

            return;
        }
    }


    resetForm();

    await loadPunishments();
}


// ======================================================
// EDIT
// ======================================================

function editPunishment(id) {

    const item =
        punishments.find(
            punishment =>
                punishment.id === id
        );

    if (!item) {
        return;
    }

    document.getElementById("editId").value =
        item.id;

    document.getElementById("username").value =
        item.username;

    document.getElementById("reason").value =
        item.reason;

    document.getElementById("punishmentType").value =
        item.punishment_type;

    document.getElementById("duration").value =
        item.duration || "Doimiy";

    document.getElementById("moderator").value =
        item.moderator;

    document.getElementById("formTitle").textContent =
        "Jazoni tahrirlash";

    document.getElementById("saveText").textContent =
        "Saqlash";

    document.getElementById("cancelEdit").style.display =
        "inline-block";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ======================================================
// DELETE / CANCEL
// ======================================================

async function deletePunishment(id) {

    const item =
        punishments.find(
            punishment =>
                punishment.id === id
        );

    if (!item) {
        return;
    }

    const confirmDelete =
        confirm(
            `${item.username} uchun jazoni bekor qilmoqchimisiz?`
        );

    if (!confirmDelete) {
        return;
    }


    const { error } =
        await supabaseClient
            .from("punishments")
            .update({
                status: "cancelled"
            })
            .eq("id", id);


    if (error) {

        console.error(error);

        alert(
            "Jazoni bekor qilishda xatolik."
        );

        return;
    }

    await loadPunishments();
}


// ======================================================
// RESET FORM
// ======================================================

function resetForm() {

    document.getElementById("punishmentForm").reset();

    document.getElementById("editId").value =
        "";

    document.getElementById("moderator").value =
        "Fazilchik";

    document.getElementById("formTitle").textContent =
        "Jazo qo‘shish";

    document.getElementById("saveText").textContent =
        "Jazo qo‘shish";

    document.getElementById("cancelEdit").style.display =
        "none";

    updateDuration();
}


function cancelEdit() {

    resetForm();
}


// ======================================================
// STATS
// ======================================================

function updateStats() {

    const active =
        getActivePunishments();

    const warnings =
        active.filter(
            item =>
                item.punishment_type ===
                "Ogohlantirish"
        ).length;

    const mutes =
        active.filter(
            item =>
                item.punishment_type
                    .includes("Mute")
        ).length;

    const bans =
        active.filter(
            item =>
                item.punishment_type ===
                "Ban"
        ).length;


    document.getElementById("totalCount")
        .textContent = active.length;

    document.getElementById("warningCount")
        .textContent = warnings;

    document.getElementById("muteCount")
        .textContent = mutes;

    document.getElementById("banCount")
        .textContent = bans;


    document.getElementById("adminTotal")
        .textContent = active.length;

    document.getElementById("adminWarnings")
        .textContent = warnings;

    document.getElementById("adminMutes")
        .textContent = mutes;

    document.getElementById("adminBans")
        .textContent = bans;
}


// ======================================================
// 3 WARNING ALERT
// ======================================================

function updateWarningAlert() {

    const alertBox =
        document.getElementById("warningAlert");

    const alertText =
        document.getElementById("warningAlertText");

    if (!alertBox || !alertText) {
        return;
    }


    const warningUsers = {};

    punishments.forEach(item => {

        if (
            item.punishment_type !==
            "Ogohlantirish"
        ) {
            return;
        }

        if (!warningUsers[item.username]) {

            warningUsers[item.username] = 0;
        }

        warningUsers[item.username]++;
    });


    const reached =
        Object.entries(warningUsers)
            .filter(
                ([username, count]) =>
                    count >= 3
            );


    if (reached.length === 0) {

        alertBox.style.display =
            "none";

        return;
    }


    alertBox.style.display =
        "block";


    alertText.textContent =
        ` ${reached.length} ta foydalanuvchi 3 yoki undan ko‘p ogohlantirishga yetgan.`;
}


// ======================================================
// SESSION
// ======================================================

async function checkSession() {

    const {
        data
    } = await supabaseClient.auth.getSession();

    if (data.session) {

        showPage("adminPage");

    } else {

        showPage("userPage");
    }
}


// ======================================================
// START
// ======================================================

async function startApp() {

    await loadPunishments();

    await checkSession();
}


// ======================================================
// AUTO REFRESH
// ======================================================

setInterval(
    async function() {

        await loadPunishments();

    },
    30000
);


// ======================================================
// RUN
// ======================================================

startApp();