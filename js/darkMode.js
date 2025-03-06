

function toggleDarkMode() {
    let root = document.getElementsByTagName("html")[0];
    let darkModeName = "dark-mode";
    let darkModeOn = root.classList.contains(darkModeName);

    if (darkModeOn) {
        root.classList.remove(darkModeName);
        return;
    }
    root.classList.add(darkModeName);
}
