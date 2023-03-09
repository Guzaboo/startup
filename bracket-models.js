class Bracket {
    name // String
    id // String
    participants // Participant[]
    elim // int
    final // Match
    matches // Map from String to Match
    date // long

    constructor(name, participants, elim = 1, id, final, matches, date) {
        if(id === undefined) {
            if(participants.length < 2) throw new Error("Not enough participants! Expected: 2+, Received: " + participants.length)
            if(elim < 1) throw new Error("Must be at least single elimination! Received: " + elim)
            if(elim > 2) throw new Error("N-elim brackets haven't been implemented yet! Received: N=" + elim)
            
            this.name = name
            let brackets = JSON.parse(localStorage.getItem("brackets"))
            if(brackets === null) brackets = []
            this.id = this.#generateUUID()
            this.participants = participants;
            this.elim = elim
            this.matches = new Map()
            this.date = new Date().getTime()

            this.#generateBrackets()
        } else {
            this.name = name
            this.participants = participants
            this.elim = elim
            this.id = id
            this.final = this.#createMatchFromJSON(final)
            this.matches = this.#createMatchesFromJSON(new Map(Object.entries(matches)))
            this.date = date
        }
    }

    #createMatchesFromJSON(matches) {
        let newM = new Map()
        matches.forEach(m => newM.set(m.id, this.#createMatchFromJSON(m)))
        return newM
    }

    #createMatchFromJSON(m) {
        let par1 = m.par1.getLoser === undefined ? new Participant(m.par1.name) : new MatchReference(m.par1.id, m.par1.getLoser)
        let par2 = m.par2.getLoser === undefined ? new Participant(m.par2.name) : new MatchReference(m.par2.id, m.par2.getLoser)
        return new Match(par1, par2, m.id)
    }

    getRounds = function() {
        this.matches.get(this.final.id).round = this.#setMatchRounds(this.final)
        let r = new Map()
        r.set(this.final.id, this.final)

        let rounds = [r]
        let backlog = []
        let numRounds = this.final.round
        while(rounds.length < numRounds) {
            r = new Map()
            // put all the matches linked to from matches in rounds[0] into the new map
            let lastR = rounds[0]

            for(let i = 0; i < backlog.length; i++) {
                if(backlog[i].round == numRounds - rounds.length) {
                    r.set(backlog[i].id, backlog[i])
                    backlog.splice(i--, 1)
                }
            }

            lastR.forEach((m) => {
                if(m.par1 instanceof MatchReference && !m.par1.getLoser) {
                    if(this.matches.get(m.par1.id).round + 1 == m.round) r.set(m.par1.id, this.matches.get(m.par1.id))
                    else backlog.push(this.matches.get(m.par1.id))
                }
                if(m.par2 instanceof MatchReference && !m.par2.getLoser) {
                    if(this.matches.get(m.par2.id).round + 1 == m.round) r.set(m.par2.id, this.matches.get(m.par2.id))
                    else backlog.push(this.matches.get(m.par2.id))
                }
            })

            // insert the new map at the start of rounds
            rounds.unshift(r)
        }

        return rounds
    }

    #setMatchRounds(m) {
        let par1Height = 0
        let par2Height = 0
        if(m.par1 instanceof MatchReference) {
            par1Height = this.#setMatchRounds(this.matches.get(m.par1.id))
            if(m.par1.getLoser) par1Height--
        }
        if(m.par2 instanceof MatchReference) {
            par2Height = this.#setMatchRounds(this.matches.get(m.par2.id))
            if(m.par2.getLoser) par2Height--
        }
        this.#setMatchRoundsBacktrack(m, Math.max(par1Height, par2Height) + 1)
        return m.round
    }

    #setMatchRoundsBacktrack(m, height) {
        m.round = height
        if(m.par1 instanceof MatchReference) {
            if(!m.par1.getLoser) this.#setMatchRoundsBacktrack(this.matches.get(m.par1.id), height - 1)
            else this.#setMatchRoundsBacktrack(this.matches.get(m.par1.id), height)
        }
        if(m.par2 instanceof MatchReference && !m.par2.getLoser) {
            if(!m.par2.getLoser) this.#setMatchRoundsBacktrack(this.matches.get(m.par2.id), height - 1)
            else this.#setMatchRoundsBacktrack(this.matches.get(m.par2.id), height)
        }

    }

    #isLeafRound(r) {
        let res = true;
        r.forEach((m) => {
            if(m.par1 instanceof MatchReference && !m.par2.getLoser) res = false;
            if(m.par2 instanceof MatchReference && !m.par2.getLoser) res = false;
        })
        return res
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

    #generateUUID() { // Public Domain/MIT
        var d = new Date().getTime();//Timestamp
        var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16;//random number between 0 and 16
            if(d > 0){//Use timestamp until depleted
                r = (d + r)%16 | 0;
                d = Math.floor(d/16);
            } else {//Use microseconds since page-load if supported
                r = (d2 + r)%16 | 0;
                d2 = Math.floor(d2/16);
            }
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
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

    constructor(par1, par2, id = "M" + ++matchID) {
        this.id = id
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