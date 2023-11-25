
var id = "window_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
document.getElementById("windowid").innerHTML = id;

// add event listener so all windows can communicate its position and size
window.addEventListener("storage", (event) => {
    if (event.storageArea != localStorage) return;
    let data = JSON.parse(event.newValue);
    localStorage.setItem(event.key, JSON.stringify(data))

})


var init = {
    x: 1000,
    y: 500,
    width: 32,
    height: 32,
    direction: 1,
}

const getDuck = () => {
    let duck = localStorage.getItem("duck");
    duck = JSON.parse(duck);
    if (duck == null) {
        duck = {
            x: 1000,
            y: 500,
            width: 32,
            height: 32,
            direction: 1,
        }
    }
    return duck;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));
// position relative to edge of screen

var isMain = false;


var w, h, x, y, duck;

function getAllWindowLocalStorage() {
    let keys = Object.keys(localStorage);
    let windowKeys = keys.filter(key => key.startsWith("window_"));
    let windowLocalStorage = {};
    for (let key of windowKeys) {
        windowLocalStorage[key] = JSON.parse(localStorage.getItem(key));
    }
    return windowLocalStorage;
}

const main = async () => {
    let duckObj = document.getElementById("duck");
    let resetInput = document.getElementById("reset");
    let label = document.getElementById("duckpos");

    while (true) {
        duck = getDuck();
        await sleep(10);

        if (duck.direction == 1 && duckObj.src.endsWith("Walking_inv.gif")) {
            duckObj.src = "Walking.gif";
        }
        if (duck.direction == -1 && duckObj.src.endsWith("Walking.gif")) {
            duckObj.src = "Walking_inv.gif"
        }

        w = window.innerWidth;
        h = window.innerHeight;
        // window position
        x = window.screenX;
        y = window.screenY;

        ybottomleft = y + h;
        xbottomleft = x + w;
        ybottomright = y + h;
        xbottomright = x + w;

        // check if reset checkbox is checked
        if (resetInput.checked) {
            window.localStorage.clear()
            resetInput.checked = false;
            window.location.reload();
            return
        }



        // convert from relative screen to edge of screen to relative window to edge of window
        let xduckwindow = duck.x - x;
        let yduckwindow = duck.y - y;

        // update duck position
        duckObj.style.left = xduckwindow + "px";
        duckObj.style.top = yduckwindow + "px";

        // only control the duck from main window
        if (isMain) {
            // simulate gravity
            let windows = getAllWindowLocalStorage();
            // check if duck is in any window

            let isInDuckWindow = []
            let ry = ""
            for (let windowKey of Object.keys(windows)) {
                let window = windows[windowKey];
                window.key = windowKey;
                if (duck.x > window.x && duck.x < window.x + window.w) {
                    isInDuckWindow.push(window);
                }
            }
            let lowestWindow = null
            isInDuckWindow.sort((a, b) => {
                return (b.y + b.h) - (a.y + a.h);
            })
            if (isInDuckWindow.length > 0) {
                lowestWindow = isInDuckWindow[0];
            }

            document.getElementById("how_many_windows").innerHTML = Object.keys(windows).length + "_" + isInDuckWindow.length;

            // GRAVITYYYYY
            if (lowestWindow != null) {
                if (duck.y + duck.height < lowestWindow.y + lowestWindow.h) {
                    duck.y += 1;
                }
            }
            // move left right
            if (lowestWindow != null) {
                if (duck.x + duck.width > lowestWindow.x + lowestWindow.w) {
                    duck.direction = -1;
                }
                if (duck.x < lowestWindow.x +2) {
                    duck.direction = 1;
                }
                duck.x += duck.direction;
            }

            // move upward if below lowest window
            if (lowestWindow != null) {
                if (duck.y + duck.height > lowestWindow.y + lowestWindow.h) {
                    duck.y -= 2;
                }
            }
        }

        if (resetInput.checked) {
            duck = Object.assign({}, init);
            localStorage.setItem("duck", JSON.stringify(duck));
            resetInput.checked = false;
        }

        if (isMain) {
            localStorage.setItem("duck", JSON.stringify(duck));
        }

        localStorage.setItem(id, JSON.stringify({ "w": w, "h": h, "x": x, "y": y }));
        label.innerHTML = xduckwindow + " " + yduckwindow;
    }
}

document.getElementById("main").addEventListener("click", () => {
    document.getElementById("main").style.backgroundColor = "green";
    document.getElementById("main").style.color = "white";
    isMain = true;
})

main()
