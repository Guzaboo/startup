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
        this.final = this.#addMatch(this.participants[0], this.participants[1])
        let numParticipants = this.participants.length
        let doubleElim = this.elim > 1

        let wSeq
        let lSeq
        let wFinal = this.final
        let lRoot

        
        if(doubleElim && numParticipants < 3) throw new Error("Double elimination requires 3+ participants! Received: " + numParticipants)

        if(numParticipants >= 3) {
            wSeq = winnersBracketSequence(numParticipants)
            let m = this.#placeTeam(this.participants[2], wFinal, wSeq[0])
            if(doubleElim) {
                lRoot = this.#addMatch(new MatchReference(wFinal.id, true), new MatchReference(m.id, true))
                this.final = this.#addMatch(new MatchReference(wFinal.id, false), new MatchReference(lRoot.id, false))
            }
        }

        if(numParticipants >= 4) {
            let m = this.#placeTeam(this.participants[3], wFinal, wSeq[1])
            if(doubleElim) {
                let m2 = this.#addMatch(lRoot.par2, new MatchReference(m.id, true))
                lRoot.par2 = new MatchReference(m2.id, false)
                lRoot = m2
            }
        }

        if(numParticipants >= 5) {
            lSeq = losersBracketSequence(numParticipants)

            for(let i = 4; i < numParticipants; i++) {
                let m = this.#placeTeam(this.participants[i], wFinal, wSeq[i - 2])
                if(doubleElim) {
                    this.#placeTeam(new MatchReference(m.id, true), lRoot, lSeq[i - 4])
                }
            }
        }
                //this.#placeTeamInLosers(this.participants[i], this.final, wSeq[i - 2])
    }

    #addMatch(par1, par2) {
        let m = new Match(par1, par2)
        this.matches.set(m.id, m)
        return m
    }

    #placeTeam(participant, startingMatch, path) { // participant = Participant, startingMatch = Match, path = int[]
        let matchPtr = startingMatch
        for(let i = 0; i < path.length - 1; i++) {
            if(path[i]) matchPtr = this.#findMatch(matchPtr.par1.id)
            else matchPtr = this.#findMatch(matchPtr.par2.id)
        }

        if(path[path.length - 1]) {
            let m = this.#addMatch(matchPtr.par1, participant)
            matchPtr.par1 = new MatchReference(m.id)
            return m
        } else {
            let m = this.#addMatch(matchPtr.par2, participant)
            matchPtr.par2 = new MatchReference(m.id)
            return m
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