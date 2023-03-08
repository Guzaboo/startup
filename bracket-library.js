function sortByDate(bracketArr) {
    return bracketArr.sort((b1, b2) => JSON.parse(localStorage.getItem(b2)).date - JSON.parse(localStorage.getItem(b1)).date)
}

let brackets = JSON.parse(localStorage.getItem("brackets"))

let bracketList = document.querySelector(".bracket-list")

if(brackets !== null) {
    brackets = sortByDate(brackets)
    brackets.forEach(b => {
        let bracket = JSON.parse(localStorage.getItem(b))
        let name = bracket.name
        let type = bracket.elim === 1 ? "Single Elimination" : "Double Elimination"
        let participants = bracket.participants.length + " participants"
        let id = bracket.id

        let bracketItem = document.createElement("div")
        bracketItem.classList.add("bracket-list-item")
        bracketItem.id = id

        let bracketLink = document.createElement("div")
        bracketLink.classList.add("bracket-list-link")
        bracketLink.addEventListener("click", function(){ loadBracket(this)})

        let bracketTitle = document.createElement("h4")
        bracketTitle.classList.add("bracket-list-title")
        bracketTitle.textContent = name

        bracketLink.appendChild(bracketTitle)

        let bracketInfo = document.createElement("div")
        bracketInfo.classList.add("bracket-list-info-block")

        let bracketType = document.createElement("h4")
        bracketType.classList.add("bracket-list-type")
        bracketType.textContent = type

        bracketInfo.appendChild(bracketType)

        let bracketParticipants = document.createElement("h4")
        bracketParticipants.classList.add("bracket-list-num-participants")
        bracketParticipants.textContent = participants

        bracketInfo.appendChild(bracketParticipants)
        bracketLink.appendChild(bracketInfo)
        bracketItem.appendChild(bracketLink)

        let bracketDelete = document.createElement("span")
        bracketDelete.classList.add("bracket-list-delete")
        bracketDelete.addEventListener("click", function(){ deleteBracket(this)})

        let deleteImg = document.createElement("img")
        deleteImg.src = "trash_white.png"

        bracketDelete.appendChild(deleteImg)
        bracketItem.appendChild(bracketDelete)

        bracketList.appendChild(bracketItem)
    })
}

function deleteBracket(e) {
    console.log(e)
    console.log(e.parentElement.id)
    brackets.splice(brackets.indexOf(e.parentElement.id), 1)
    localStorage.setItem("brackets", JSON.stringify(brackets))
    localStorage.removeItem(e.parentElement.id)
    bracketList.removeChild(e.parentElement)
}

function loadBracket(e) {
    window.location.href = "loadbracket.html?" + e.parentElement.id
}