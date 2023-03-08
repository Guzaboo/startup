(function () {
    'use strict'
  
    let forms = document.querySelectorAll('.needs-validation')
    let nameBox = document.querySelector('#bracketName')
    let participantsBox = document.querySelector('#participantsList')
    let doubleElimCheck = document.querySelector('#doubleElim')
    let participantsInvalidMessage = document.querySelector('#participantsList ~ .invalid-tooltip')

  
    Array.prototype.slice.call(forms).forEach(function (form) {
        form.addEventListener('submit', function (event) {
            console.log(nameBox.textContent.toString())
            if(nameBox.value === '') {
                nameBox.classList.add('is-invalid')
                event.preventDefault()
                event.stopPropagation()
            } else {
                nameBox.classList.remove('is-invalid')
            }

            if(!hasEnoughTeams(participantsBox.value, doubleElimCheck.checked)) {
                if(doubleElimCheck.checked) participantsInvalidMessage.textContent = 'Double elimination brackets require at least three teams.'
                else participantsInvalidMessage.textContent = 'Single elimination brackets require at least two teams.'
                participantsBox.classList.add('is-invalid')
                event.preventDefault()
                event.stopPropagation()
            } else {
                participantsBox.classList.remove('is-invalid')
            }
        }, false)
    })
})()

function hasEnoughTeams(p, double = false) {
    if(double) return /.+\n+.+\n+.+/im.test(p)
    return /.+\n+.+/im.test(p)
}

function getParticipants() {
    let participantsBox = document.querySelector('#participantsList')
    let p = participantsBox.value.split('\n')
    p = p.filter(name => name !== '')
    p = p.map(name => new Participant(name))
    
    return p
}

function randomizeSeeds(p) {
    for(let i = 0; i < p.length; i++) {
        let r = Math.floor(Math.random() * (p.length - i)) + i
        temp = p[r]
        p[r] = p[i]
        p[i] = temp
    }

    return p
}

function generateBracket() {
    let participants = getParticipants()
    
    let randomSeedsCheck = document.querySelector('#randomizeSeeds')
    if(randomSeedsCheck.checked) participants = randomizeSeeds(participants)

    let nameBox = document.querySelector('#bracketName')
    let doubleElimCheck = document.querySelector('#doubleElim')

    let name = nameBox.value

    let elim = 1
    if(doubleElimCheck.checked) elim = 2

    let bracket = new Bracket(name, participants, elim)

    let brackets = JSON.parse(localStorage.getItem("brackets"))
    if(brackets === null) {
        brackets = []
        brackets.push(bracket.id)
        localStorage.setItem("brackets", JSON.stringify(brackets))
    } else {
        brackets.push(bracket.id)
        localStorage.setItem("brackets", JSON.stringify(brackets))
    }

    bracket.matches = Object.fromEntries(bracket.matches)
    localStorage.setItem(bracket.id, JSON.stringify(bracket))

    console.log(bracket)
}