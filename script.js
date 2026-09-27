/* =========================================
   MC MOD HUB — JAZOLANGANLAR
========================================= */


/* =========================================
   MA'LUMOTLARNI YUKLASH
========================================= */

let punishments =
    JSON.parse(
        localStorage.getItem(
            "mcmodhub_punishments"
        )
    ) || [];


/* =========================================
   DEMO MA'LUMOT
   Birinchi marta ochilganda chiqadi
========================================= */

if (punishments.length === 0) {

    const now = Date.now();

    punishments = [

        {
            id: now + 1,

            username: "Steve",

            reason: "Reklama tarqatish",

            type: "Ogohlantirish",

            duration: "—",

            count: 1,

            date: "27.09.2026 10:15",

            createdAt: now - 3600000,

            expiresAt: null,

            moderator: "Fazilchik"
        },


        {
            id: now + 2,

            username: "Alex",

            reason: "Qoidani buzish",

            type: "Ogohlantirish",

            duration: "—",

            count: 1,

            date: "27.09.2026 10:30",

            createdAt: now - 3000000,

            expiresAt: null,

            moderator: "Fazilchik"
        },


        {
            id: now + 3,

            username: "Alex",

            reason: "Spam",

            type: "Ogohlantirish",

            duration: "—",

            count: 2,

            date: "27.09.2026 10:45",

            createdAt: now - 2500000,

            expiresAt: null,

            moderator: "Fazilchik"
        },


        {
            id: now + 4,

            username: "Alex",

            reason: "Spamni takrorlash",

            type: "Ogohlantirish",

            duration: "—",

            count: 3,

            date: "27.09.2026 11:00",

            createdAt: now - 2000000,

            expiresAt: null,

            moderator: "Fazilchik"
        }

    ];

    saveData();
}


/* =========================================
   LOCAL STORAGE
========================================= */

function saveData() {

    localStorage.setItem(
        "mcmodhub_punishments",
        JSON.stringify(punishments)
    );
}


/* =========================================
   ID YARATISH
========================================= */

function generateId() {

    return Date.now() +
        Math.floor(
            Math.random() * 100000
        );
}


/* =========================================
   MUDDATNI MILLISEKUNDGA O‘GIRISH
========================================= */

function getDurationMs(type) {

    switch (type) {

        case "Mute 1 soat":
            return 1 * 60 * 60 * 1000;

        case "Mute 6 soat":
            return 6 * 60 * 60 * 1000;

        case "Mute 12 soat":
            return 12 * 60 * 60 * 1000;

        case "Mute 24 soat":
            return 24 * 60 * 60 * 1000;

        default:
            return null;
    }
}


/* =========================================
   MUDDAT NOMI
========================================= */

function getDefaultDuration(type) {

    switch (type) {

        case "Ogohlantirish":
            return "—";

        case "Mute 1 soat":
            return "1 soat";

        case "Mute 6 soat":
            return "6 soat";

        case "Mute 12 soat":
            return "12 soat";

        case "Mute 24 soat":
            return "24 soat";

        case "Ban":
            return "Doimiy";

        default:
            return "—";
    }
}


/* =========================================
   MUDDATI TUGAGAN JAZOLARNI O‘CHIRISH
========================================= */

function removeExpiredPunishments() {

    const currentTime =
        Date.now();


    const oldLength =
        punishments.length;


    punishments =
        punishments.filter(
            item => {

                /*
                    Ogohlantirish va Ban
                    uchun expiresAt yo‘q.
                */

                if (
                    !item.expiresAt
                ) {
                    return true;
                }


                /*
                    Muddati hali tugamagan.
                */

                return (
                    item.expiresAt >
                    currentTime
                );

            }
        );


    if (
        punishments.length !==
        oldLength
    ) {

        saveData();

    }
}


/* =========================================
   HAR 1 SEKUNDA TEKSHIRISH
========================================= */

setInterval(
    function () {

        removeExpiredPunishments();


        const adminPage =
            document.getElementById(
                "adminPage"
            );


        const userPage =
            document.getElementById(
                "userPage"
            );


        if (
            adminPage &&
            !adminPage.classList.contains(
                "hidden"
            )
        ) {

            renderAdminTable();

            updateStats();

            updateReminder();

        }


        if (
            userPage &&
            !userPage.classList.contains(
                "hidden"
            )
        ) {

            renderUserTable();

        }

    },
    1000
);


/* =========================================
   BARCHA SAHIFALARNI YASHIRISH
========================================= */

function hideAllPages() {

    document
        .getElementById("loginPage")
        .classList.add("hidden");


    document
        .getElementById("userPage")
        .classList.add("hidden");


    document
        .getElementById("adminLoginPage")
        .classList.add("hidden");


    document
        .getElementById("adminPage")
        .classList.add("hidden");
}


/* =========================================
   BOSH SAHIFA
========================================= */

function goHome() {

    hideAllPages();


    document
        .getElementById("loginPage")
        .classList.remove(
            "hidden"
        );
}


/* =========================================
   FOYDALANUVCHI
========================================= */

function openUser() {

    removeExpiredPunishments();

    hideAllPages();


    document
        .getElementById("userPage")
        .classList.remove(
            "hidden"
        );


    renderUserTable();

    updateStats();
}


/* =========================================
   ADMIN LOGIN OCHISH
========================================= */

function openAdminLogin() {

    hideAllPages();


    document
        .getElementById("adminLoginPage")
        .classList.remove(
            "hidden"
        );


    document
        .getElementById("adminUsername")
        .value = "";


    document
        .getElementById("adminPassword")
        .value = "";


    document
        .getElementById("loginError")
        .textContent = "";
}


/* =========================================
   ADMIN LOGIN
========================================= */

function adminLogin() {

    const username =
        document
            .getElementById(
                "adminUsername"
            )
            .value
            .trim();


    const password =
        document
            .getElementById(
                "adminPassword"
            )
            .value;


    if (
        username === "Fazilchik" &&
        password === "mcmodhub"
    ) {

        removeExpiredPunishments();

        hideAllPages();


        document
            .getElementById("adminPage")
            .classList.remove(
                "hidden"
            );


        renderAdminTable();

        updateStats();

        updateReminder();

    } else {

        document
            .getElementById(
                "loginError"
            )
            .textContent =
            "❌ Login yoki parol noto‘g‘ri!";

    }
}


/* =========================================
   LOGOUT
========================================= */

function logout() {

    goHome();

}


/* =========================================
   USER TABLE
========================================= */

function renderUserTable() {

    removeExpiredPunishments();


    const table =
        document.getElementById(
            "userTable"
        );


    const search =
        (
            document
                .getElementById(
                    "userSearch"
                )
                ?.value || ""
        )
            .toLowerCase()
            .replace("@", "")
            .trim();


    table.innerHTML = "";


    const filtered =
        punishments.filter(
            item => {

                return item.username
                    .toLowerCase()
                    .includes(
                        search
                    );

            }
        );


    if (
        filtered.length === 0
    ) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="empty-table"
                >
                    Jazolar topilmadi.
                </td>

            </tr>

        `;

        return;
    }


    filtered.forEach(
        function (item, index) {

            const className =
                getPunishmentClass(
                    item.type
                );


            table.innerHTML += `

                <tr>

                    <td>
                        ${index + 1}
                    </td>


                    <td>
                        <strong>
                            @${escapeHTML(
                                item.username
                            )}
                        </strong>
                    </td>


                    <td>
                        ${escapeHTML(
                            item.reason
                        )}
                    </td>


                    <td
                        class="${className}"
                    >
                        ${escapeHTML(
                            item.type
                        )}
                    </td>


                    <td>
                        ${escapeHTML(
                            item.duration
                        )}
                    </td>


                    <td>
                        ${item.count}
                    </td>


                    <td>
                        ${escapeHTML(
                            item.date
                        )}
                    </td>


                    <td>
                        ${escapeHTML(
                            item.moderator
                        )}
                    </td>

                </tr>

            `;

        }
    );


    updateStats();

}


/* =========================================
   ADMIN TABLE
========================================= */

function renderAdminTable() {

    removeExpiredPunishments();


    const table =
        document.getElementById(
            "adminTable"
        );


    const search =
        (
            document
                .getElementById(
                    "adminSearch"
                )
                ?.value || ""
        )
            .toLowerCase()
            .replace("@", "")
            .trim();


    table.innerHTML = "";


    const filtered =
        punishments.filter(
            item => {

                return item.username
                    .toLowerCase()
                    .includes(
                        search
                    );

            }
        );


    if (
        filtered.length === 0
    ) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="9"
                    class="empty-table"
                >
                    Jazolar topilmadi.
                </td>

            </tr>

        `;

        return;
    }


    filtered.forEach(
        function (item, index) {

            const className =
                getPunishmentClass(
                    item.type
                );


            table.innerHTML += `

                <tr>

                    <td>
                        ${index + 1}
                    </td>


                    <td>
                        <strong>
                            @${escapeHTML(
                                item.username
                            )}
                        </strong>
                    </td>


                    <td>
                        ${escapeHTML(
                            item.reason
                        )}
                    </td>


                    <td
                        class="${className}"
                    >
                        ${escapeHTML(
                            item.type
                        )}
                    </td>


                    <td>
                        ${escapeHTML(
                            item.duration
                        )}
                    </td>


                    <td>
                        ${item.count}
                    </td>


                    <td>
                        ${escapeHTML(
                            item.date
                        )}
                    </td>


                    <td>
                        ${escapeHTML(
                            item.moderator
                        )}
                    </td>


                    <td>

                        <div
                            class="action-buttons"
                        >

                            <button
                                class="action-button edit-btn"
                                title="Tahrirlash"
                                onclick="editPunishment(${item.id})"
                            >
                                ✏️
                            </button>


                            <button
                                class="action-button cancel-punishment-btn"
                                title="Jazoni bekor qilish"
                                onclick="cancelPunishment(${item.id})"
                            >
                                ❌
                            </button>

                        </div>

                    </td>

                </tr>

            `;

        }
    );


    updateReminder();

}


/* =========================================
   JAZO KLASSI
========================================= */

function getPunishmentClass(type) {

    if (
        type === "Ogohlantirish"
    ) {

        return "warning";

    }


    if (
        type.includes("Mute")
    ) {

        return "mute";

    }


    if (
        type === "Ban"
    ) {

        return "ban";

    }


    return "";

}


/* =========================================
   JAZO QO‘SHISH FORMASINI OCHISH
========================================= */

function openAddPunishment() {

    const form =
        document.getElementById(
            "addPunishment"
        );


    form.classList.remove(
        "hidden"
    );


    document
        .getElementById(
            "formTitle"
        )
        .textContent =
        "Yangi jazo qo‘shish";


    document
        .getElementById(
            "editId"
        )
        .value = "";


    document
        .getElementById(
            "username"
        )
        .value = "";


    document
        .getElementById(
            "reason"
        )
        .value = "";


    document
        .getElementById(
            "punishmentType"
        )
        .value =
        "Ogohlantirish";


    document
        .getElementById(
            "punishmentDuration"
        )
        .value = "";


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================
   FORMNI YOPISH
========================================= */

function closeAddPunishment() {

    document
        .getElementById(
            "addPunishment"
        )
        .classList.add(
            "hidden"
        );


    document
        .getElementById(
            "editId"
        )
        .value = "";

}


/* =========================================
   MUDDAT PLACEHOLDER
========================================= */

function updateDurationPlaceholder() {

    const type =
        document
            .getElementById(
                "punishmentType"
            )
            .value;


    const input =
        document
            .getElementById(
                "punishmentDuration"
            );


    input.placeholder =
        getDefaultDuration(
            type
        );


    /*
       Admin xohlasa o‘ziga
       kerakli yozuvni ham kirita oladi.
    */

}


/* =========================================
   JAZONI SAQLASH
========================================= */

function savePunishment() {

    const username =
        document
            .getElementById(
                "username"
            )
            .value
            .trim()
            .replace(/^@/, "");


    const reason =
        document
            .getElementById(
                "reason"
            )
            .value
            .trim();


    const type =
        document
            .getElementById(
                "punishmentType"
            )
            .value;


    const durationInput =
        document
            .getElementById(
                "punishmentDuration"
            )
            .value
            .trim();


    const editId =
        document
            .getElementById(
                "editId"
            )
            .value;


    /* VALIDATSIYA */

    if (
        !username
    ) {

        alert(
            "Telegram username kiriting!"
        );

        return;
    }


    if (
        !reason
    ) {

        alert(
            "Jazo sababini kiriting!"
        );

        return;
    }


    /* =====================================
       TAHRIRLASH
    ===================================== */

    if (
        editId
    ) {

        const index =
            punishments.findIndex(
                item =>
                    item.id ===
                    Number(editId)
            );


        if (
            index === -1
        ) {

            alert(
                "Jazo topilmadi!"
            );

            return;
        }


        const old =
            punishments[index];


        let duration =
            durationInput ||
            getDefaultDuration(
                type
            );


        const durationMs =
            getDurationMs(
                type
            );


        let expiresAt =
            null;


        /*
            Tahrirlangan mute
            aynan tahrirlash
            vaqtida yangi muddat oladi.
        */

        if (
            durationMs
        ) {

            const createdAt =
                Date.now();


            expiresAt =
                createdAt +
                durationMs;

        }


        punishments[index] = {

            ...old,

            username,

            reason,

            type,

            duration,

            createdAt:
                durationMs
                    ? Date.now()
                    : old.createdAt,

            expiresAt,

            moderator:
                "Fazilchik"

        };


        saveData();

        closeAddPunishment();

        renderAdminTable();

        renderUserTable();

        updateStats();

        updateReminder();


        alert(
            "✅ Jazo muvaffaqiyatli tahrirlandi!"
        );


        return;
    }


    /* =====================================
       YANGI JAZO
    ===================================== */


    /*
        Ushbu foydalanuvchining
        mavjud jazo soni.
    */

    const previousCount =
        punishments.filter(
            item =>
                item.username
                    .toLowerCase() ===
                username.toLowerCase()
        ).length;


    const count =
        previousCount + 1;


    let duration =
        durationInput ||
        getDefaultDuration(
            type
        );


    const createdAt =
        Date.now();


    const durationMs =
        getDurationMs(
            type
        );


    let expiresAt =
        null;


    if (
        durationMs
    ) {

        expiresAt =
            createdAt +
            durationMs;

    }


    const now =
        new Date();


    const date =
        String(
            now.getDate()
        ).padStart(2, "0")
        +
        "."
        +
        String(
            now.getMonth() + 1
        ).padStart(2, "0")
        +
        "."
        +
        now.getFullYear()
        +
        " "
        +
        String(
            now.getHours()
        ).padStart(2, "0")
        +
        ":"
        +
        String(
            now.getMinutes()
        ).padStart(2, "0");


    punishments.push({

        id:
            generateId(),

        username,

        reason,

        type,

        duration,

        count,

        date,

        createdAt,

        expiresAt,

        moderator:
            "Fazilchik"

    });


    saveData();


    closeAddPunishment();


    renderAdminTable();

    renderUserTable();

    updateStats();

    updateReminder();


    alert(
        "✅ Jazo muvaffaqiyatli qo‘shildi!"
    );

}


/* =========================================
   JAZONI TAHRIRLASH
========================================= */

function editPunishment(id) {

    const item =
        punishments.find(
            punishment =>
                punishment.id === id
        );


    if (
        !item
    ) {

        alert(
            "Jazo topilmadi!"
        );

        return;
    }


    document
        .getElementById(
            "addPunishment"
        )
        .classList.remove(
            "hidden"
        );


    document
        .getElementById(
            "formTitle"
        )
        .textContent =
        "Jazoni tahrirlash";


    document
        .getElementById(
            "editId"
        )
        .value =
        item.id;


    document
        .getElementById(
            "username"
        )
        .value =
        item.username;


    document
        .getElementById(
            "reason"
        )
        .value =
        item.reason;


    document
        .getElementById(
            "punishmentType"
        )
        .value =
        item.type;


    document
        .getElementById(
            "punishmentDuration"
        )
        .value =
        item.duration === "—"
            ? ""
            : item.duration;


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================
   JAZONI BEKOR QILISH
========================================= */

function cancelPunishment(id) {

    const item =
        punishments.find(
            punishment =>
                punishment.id === id
        );


    if (
        !item
    ) {

        return;

    }


    const confirmed =
        confirm(
            `@${item.username} foydalanuvchisining ushbu jazosini bekor qilmoqchimisiz?`
        );


    if (
        !confirmed
    ) {

        return;

    }


    punishments =
        punishments.filter(
            punishment =>
                punishment.id !== id
        );


    saveData();


    renderAdminTable();

    renderUserTable();

    updateStats();

    updateReminder();


    alert(
        "✅ Jazo bekor qilindi!"
    );

}


/* =========================================
   STATISTIKA
========================================= */

function updateStats() {

    const total =
        punishments.length;


    const warnings =
        punishments.filter(
            item =>
                item.type ===
                "Ogohlantirish"
        ).length;


    const mutes =
        punishments.filter(
            item =>
                item.type.includes(
                    "Mute"
                )
        ).length;


    const bans =
        punishments.filter(
            item =>
                item.type ===
                "Ban"
        ).length;


    /* USER */

    const totalUsers =
        document.getElementById(
            "totalUsers"
        );


    const warningUsers =
        document.getElementById(
            "warningUsers"
        );


    const muteUsers =
        document.getElementById(
            "muteUsers"
        );


    const banUsers =
        document.getElementById(
            "banUsers"
        );


    if (
        totalUsers
    ) {

        totalUsers.textContent =
            total;

    }


    if (
        warningUsers
    ) {

        warningUsers.textContent =
            warnings;

    }


    if (
        muteUsers
    ) {

        muteUsers.textContent =
            mutes;

    }


    if (
        banUsers
    ) {

        banUsers.textContent =
            bans;

    }


    /* ADMIN */

    const adminTotal =
        document.getElementById(
            "adminTotal"
        );


    const adminWarnings =
        document.getElementById(
            "adminWarnings"
        );


    const adminMutes =
        document.getElementById(
            "adminMutes"
        );


    const adminBans =
        document.getElementById(
            "adminBans"
        );


    if (
        adminTotal
    ) {

        adminTotal.textContent =
            total;

    }


    if (
        adminWarnings
    ) {

        adminWarnings.textContent =
            warnings;

    }


    if (
        adminMutes
    ) {

        adminMutes.textContent =
            mutes;

    }


    if (
        adminBans
    ) {

        adminBans.textContent =
            bans;

    }

}


/* =========================================
   3 TA OGOHLANTIRISH ESLATMASI
========================================= */

function updateReminder() {

    const reminder =
        document.getElementById(
            "reminderText"
        );


    if (
        !reminder
    ) {

        return;

    }


    const users = {};


    punishments.forEach(
        item => {

            if (
                !users[
                    item.username
                ]
            ) {

                users[
                    item.username
                ] = 0;

            }


            if (
                item.type ===
                "Ogohlantirish"
            ) {

                users[
                    item.username
                ]++;

            }

        }
    );


    const warningUsers =
        Object.entries(
            users
        ).filter(
            ([username, count]) =>
                count >= 3
        );


    if (
        warningUsers.length === 0
    ) {

        reminder.textContent =
            "3 yoki undan ko‘p ogohlantirish olgan foydalanuvchilar yo‘q.";

        return;

    }


    reminder.textContent =
        warningUsers
            .map(
                ([username, count]) =>
                    `@${username} — ${count} ta ogohlantirish`
            )
            .join("  •  ");

}


/* =========================================
   HTML XAVFSIZLIGI
========================================= */

function escapeHTML(text) {

    if (
        text === null ||
        text === undefined
    ) {

        return "";

    }


    return String(text)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


/* =========================================
   BOSHLANG‘ICH TEKSHIRUV
========================================= */

removeExpiredPunishments();

updateStats();