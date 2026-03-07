// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "phim4k_vip",
        "name": "Phim4K VIP",
        "version": "1.0.0",
        "baseUrl": "https://stremio.phim4k.xyz",
        "iconUrl": "https://phim4k.com/favicon.ico",
        "isEnabled": true,
        "type": "MOVIE"
    });
}

const AUTH_TOKEN = "eyJ1c2VybmFtZSI6Imh1bmciLCJwYXNzd29yZCI6Imh1bmciLCJ0cyI6MTc2NDcyNTIxNDA1NX0";

function getHomeSections() {
    return JSON.stringify([
        { slug: 'phim4k_movies', title: 'Phim4K Movies', type: 'Horizontal', path: 'catalog/movie' },
        { slug: 'phim4k_series', title: 'Phim4K Series', type: 'Horizontal', path: 'catalog/series' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Phim lẻ', slug: 'phim4k_movies' },
        { name: 'Phim bộ', slug: 'phim4k_series' },
        { name: 'Hành động', slug: 'Action & Adventure' },
        { name: 'Viễn tưởng', slug: 'Sci-Fi & Fantasy' },
        { name: 'Kinh dị', slug: 'Horror' },
        { name: 'Hoạt hình', slug: 'Animation' },
        { name: 'Hài hước', slug: 'Comedy' }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [{ name: 'Mới cập nhật', value: 'update' }]
    });
}

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    var type = (slug === 'phim4k_series') ? 'series' : 'movie';
    if (slug !== 'phim4k_movies' && slug !== 'phim4k_series') {
        return "https://stremio.phim4k.xyz/" + AUTH_TOKEN + "/catalog/" + type + "/phim4k_" + type + "s/genre=" + encodeURIComponent(slug) + ".json";
    }
    return "https://stremio.phim4k.xyz/" + AUTH_TOKEN + "/catalog/" + type + "/" + slug + ".json";
}

function getUrlSearch(keyword, filtersJson) {
    return "https://stremio.phim4k.xyz/" + AUTH_TOKEN + "/catalog/movie/phim4k_movies/search=" + encodeURIComponent(keyword) + ".json";
}

function getUrlDetail(id) {
    var type = id.indexOf('series') > -1 ? 'series' : 'movie';
    return "https://stremio.phim4k.xyz/" + AUTH_TOKEN + "/meta/" + type + "/" + id + ".json";
}

function getUrlStream(id) {
    var type = id.indexOf('series') > -1 ? 'series' : 'movie';
    return "https://stremio.phim4k.xyz/" + AUTH_TOKEN + "/stream/" + type + "/" + id + ".json";
}

function getUrlCategories() { return ""; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// PARSERS
// =============================================================================

function parseListResponse(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson);
        var items = response.metas || [];
        var movies = items.map(function (item) {
            return {
                id: item.id,
                title: item.name,
                posterUrl: item.poster || "",
                backdropUrl: item.background || "",
                year: item.name.match(/\((\d{4})\)/) ? item.name.match(/\((\d{4})\)/)[1] : 0,
                quality: "4K/Bluray",
                episode_current: "Full",
                lang: "Vietsub"
            };
        });
        return JSON.stringify({
            items: movies,
            pagination: { currentPage: 1, totalPages: 1, totalItems: movies.length, itemsPerPage: 20 }
        });
    } catch (error) { return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } }); }
}

function parseSearchResponse(apiResponseJson) { return parseListResponse(apiResponseJson); }

function parseMovieDetail(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson);
        var meta = response.meta || {};
        var servers = [{
            name: "Phim4K VIP",
            episodes: [{ id: meta.id, name: "Full", slug: meta.id }]
        }];

        return JSON.stringify({
            id: meta.id,
            title: meta.name,
            posterUrl: meta.poster || "",
            backdropUrl: meta.background || "",
            description: (meta.description || "").replace(/<[^>]*>/g, ""),
            year: meta.year || 0,
            rating: meta.imdbRating || 0,
            quality: "4K",
            servers: servers,
            category: (meta.genres || []).join(", "),
            country: meta.country || "",
            director: (meta.director || []).join(", "),
            casts: (meta.cast || []).join(", ")
        });
    } catch (error) { return "null"; }
}

function parseDetailResponse(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson);
        var streams = response.streams || [];
        var streamUrl = (streams.length > 0) ? streams[0].url : "";

        // Cấu hình Header để sửa lỗi Access Denied và lỗi không xem được phim
        return JSON.stringify({
            url: streamUrl,
            headers: { 
                "User-Agent": "Stremio/1.6.0",
                "Referer": "https://phim4k.lol/",
                "Origin": "https://phim4k.lol"
            },
            subtitles: []
        });
    } catch (error) { return "{}"; }
}

// Xử lý hiển thị ảnh với header phim4k.lol
function getImageUrl(path) {
    if (!path) return "";
    // Trả về cấu trúc có header để app có thể load ảnh từ server api.phim4k.lol
    return JSON.stringify({
        url: path,
        headers: {
            "Referer": "https://phim4k.lol/",
            "User-Agent": "Mozilla/5.0"
        }
    });
}
