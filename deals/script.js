function loadCategory(category) {

    const grid = document.getElementById("brandGrid");

    if (!grid) return;

    const list = brands[category] || [];

    renderBrands(list);

}

function renderBrands(list) {

    const grid = document.getElementById("brandGrid");

    grid.innerHTML = "";

    if (list.length === 0) {

        grid.innerHTML = `
            <div class="empty">
                No brands available.
            </div>
        `;

        return;
    }

    list.forEach(item => {

        grid.innerHTML += `

        <div class="card">

            <img src="${item.image}" alt="${item.name}">

            <div class="details">

                <div class="name">
                    ${item.name}
                </div>

                <div class="desc">
                    ${item.description}
                </div>

                <a
                    class="visit-btn"
                    href="${item.link}"
                    target="_blank"
                    rel="noopener noreferrer">

                    Visit Store →

                </a>

            </div>

        </div>

        `;

    });

}

function searchBrands() {

    const input = document
        .getElementById("searchInput")
        .value
        .toLowerCase();

    const page = window.location.pathname;

    let category = "";

    if (page.includes("shopping"))
        category = "shopping";

    else if (page.includes("fashion"))
        category = "fashion";

    else if (page.includes("travel"))
        category = "travel";

    else if (page.includes("finance"))
        category = "finance";

    const filtered = brands[category].filter(item =>

        item.name.toLowerCase().includes(input) ||

        item.description.toLowerCase().includes(input)

    );

    renderBrands(filtered);

}
