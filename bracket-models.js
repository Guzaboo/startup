class Bracket {
    name // String
    id // String
    participants // Participant[]
    elim // int
    final // Match
    matches // Map from String to Match

    constructor(name, participants, elim = 1) {
        if(participants.length < 2) throw new Error("Not enough participants! Expected: 2+, Received: " + participants.length)
        if(elim < 1) throw new Error("Must be at least single elimination! Received: " + elim)
        if(elim > 2) throw new Error("N-elim brackets haven't been implemented yet! Received: N=" + elim)
        
        this.name = name
        let brackets = localStorage.getItem("brackets")
        if(brackets === null) brackets = []
        this.id = "B" + (brackets.length + 1)
        this.participants = participants;
        this.elim = elim
        this.matches = new Map()

        this.#generateBrackets()
    }

    #generateBrackets() {
        this.final = new Match(this.participants[0], this.participants[1])
        this.matches.set(this.final.id, this.final)

        if(this.participants.length >= 3) {
            let wSeq = winnersBracketSequence(this.participants.length)
            for(let i = 2; i < this.participants.length; i++) {
                this.#placeTeam(this.participants[i], this.final, wSeq[i - 2])
            }
        }

        if(this.elim > 1) {
            if(this.participants.length >= 5) {
                let lSeq = losersBracketSequence(this.participants.length)
            }
        }
    }

    #placeTeam(participant, startingMatch, path) { // participant = Participant, startingMatch = Match, path = int[]
        let matchPtr = startingMatch
        for(let i = 0; i < path.length - 1; i++) {
            if(path[i]) matchPtr = this.#findMatch(matchPtr.par1.id)
            else matchPtr = this.#findMatch(matchPtr.par2.id)
        }

        if(path[path.length - 1]) {
            let m = new Match(matchPtr.par1, participant)
            matchPtr.par1 = new MatchReference(m.id)
            this.matches.set(m.id, m)
        } else {
            let m = new Match(matchPtr.par2, participant)
            matchPtr.par2 = new MatchReference(m.id)
            this.matches.set(m.id, m)
        }
    }

    #findMatch(id) {
        return this.matches.get(id)
    }
}

class MatchReference {
    id // String
    getLoser // boolean

    constructor(id, getLoser = false) {
        this.id = id
        this.getLoser = getLoser
    }
}

let matchID = 0

class Match {
    id // String
    par1 // MatchReference or Participant
    par2 // MatchReference or Participant

    constructor(par1, par2) {
        this.id = "M" + ++matchID
        this.par1 = par1
        this.par2 = par2
    }
}

class Participant {
    name // String

    constructor(name) {
        this.name = name
    }
}