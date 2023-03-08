let brackets = JSON.parse(localStorage.getItem("brackets"))

let bracketList = document.querySelector(".bracket-list")

brackets.forEach(b => {
    let bracket = JSON.parse(localStorage.getItem(b))
    let name = bracket.name
    let type = bracket.elim === 1 ? "Single Elimination" : "Double Elimination"
    let participants = bracket.participants.length + " participants"

    let bracketItem = document.createElement("div")
    bracketItem.classList.add("bracket-list-item")

    let bracketLink = document.createElement("div")
    bracketLink.classList.add("bracket-list-link")

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

    let deleteImg = document.createElement("img")
    deleteImg.src = "trash_white.png"

    bracketDelete.appendChild(deleteImg)
    bracketItem.appendChild(bracketDelete)

    bracketList.appendChild(bracketItem)
})