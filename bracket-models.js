class Bracket {
    name // String
    id // String
    participants // Participant[]
    elim // int
    final // Match
    matches // Map from String to Match
    date // long
    brackets //SimpleBracket[]

    constructor(name, participants, elim = 1, id, final, matches, date) {
        if(id === undefined) {
            if(participants.length < 2) throw new Error("Not enough participants! Expected: 2+, Received: " + participants.length)
            if(elim < 1) throw new Error("Must be at least single elimination! Received: " + elim)
            if(elim > 2) throw new Error("N-elim brackets haven't been implemented yet! Received: N=" + elim)
            
            this.name = name
            let bracketsStored = JSON.parse(localStorage.getItem("brackets"))
            if(bracketsStored === null) bracketsStored = []
            this.id = this.#generateUUID()
            this.participants = participants;
            this.elim = elim
            this.matches = new Map()
            this.date = new Date().getTime()
            this.brackets = []

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

    getRounds() {
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
        for(let i = 0; i < this.elim; i++) {
            this.brackets.push(new SimpleBracket())
        }

        
        let numParticipants = this.participants.length
        let doubleElim = this.elim > 1

        if(doubleElim && numParticipants < 3) throw new Error("Double elimination requires 3+ participants! Received: " + numParticipants)

        let wSeq
        let lSeq
        let wFinal = this.#addMatch(this.participants[0], this.participants[1], this.brackets[0])
        this.brackets[0].final = wFinal
        let lRoot
        let lFinal

        if(numParticipants >= 3) {
            wSeq = winnersBracketSequence(numParticipants)
            let m = this.#placeTeam(this.participants[2], wFinal, wSeq[0], this.brackets[0])
            if(doubleElim) {
                lRoot = this.#addMatch(new MatchReference(wFinal.id, true), new MatchReference(m.id, true), this.brackets[1])
                lFinal = lRoot
                this.brackets[1].final = lFinal
            }
        }

        if(numParticipants >= 4) {
            let m = this.#placeTeam(this.participants[3], wFinal, wSeq[1], this.brackets[0])
            if(doubleElim) {
                lRoot = this.#placeTeam(new MatchReference(m.id, true), lRoot, [0], this.brackets[1], this.brackets[0])
                // let m2 = this.#addMatch(lRoot.par2, new MatchReference(m.id, true), this.brackets[1])
                // lRoot.par2 = new MatchReference(m2.id, false)
                // lRoot = m2
            }
        }

        if(numParticipants >= 5) {
            lSeq = losersBracketSequence(numParticipants)

            for(let i = 4; i < numParticipants; i++) {
                let m = this.#placeTeam(this.participants[i], wFinal, wSeq[i - 2], this.brackets[0])
                if(doubleElim) {
                    this.#placeTeam(new MatchReference(m.id, true), lRoot, lSeq[i - 4], this.brackets[1], this.brackets[0])
                }
            }
        }

        if(doubleElim) {
            this.final = this.#addMatch(new MatchReference(wFinal.id, false), new MatchReference(lFinal.id, false))
        }

        let numRounds = 0
        this.brackets.forEach(b => {
            numRounds = Math.max(numRounds, b.getMaxRound())
        })

        numRounds++

        if(doubleElim) this.final.round = numRounds
        else this.final = wFinal

        this.brackets.forEach(b => b.flipRounds(numRounds)) // make first round 1 and last round numRounds - 1

        
                
    }

    #addMatch(par1, par2, bracket) {
        if(bracket === undefined) {
            let m = new Match(par1, par2)
            this.matches.set(m.id, m)
            return m
        } else {
            let m = bracket.addMatchNewRound(par1, par2)
            this.matches.set(m.id, m)
            return m
        }
    }

    #placeTeam(participant, startingMatch, path, bracket, upperBracket = undefined) { // participant = Participant, startingMatch = Match, path = int[]
        let m = bracket.placeTeam(participant, startingMatch, path, upperBracket)
        this.matches.set(m.id, m)
        return m
        let matchPtr = startingMatch
        for(let i = 0; i < path.length - 1; i++) {
            if(path[i]) matchPtr = this.#findMatch(matchPtr.par1.id)
            else matchPtr = this.#findMatch(matchPtr.par2.id)
        }

        if(path[path.length - 1]) {
            let m = this.#addMatch(matchPtr.par1, participant, bracket)
            matchPtr.par1 = new MatchReference(m.id)
            return m
        } else {
            let m = this.#addMatch(matchPtr.par2, participant, bracket)
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

class SimpleBracket {
    final // Match
    rounds // Round[]

    constructor() {
        this.rounds = []
    }

    addMatchNewRound(par1, par2) {
        let roundNum = 1
        if(this.rounds.length > 0) roundNum = this.rounds[this.rounds.length - 1].roundNum + 1
        this.rounds.push(new Round(roundNum))
        let m = this.rounds[this.rounds.length - 1].addMatch(par1, par2)
        return m
    }

    placeTeam(participant, startingMatch, path, upperBracket = undefined) {
        let matchPtr = startingMatch
        for(let i = 0; i < path.length - 1; i++) {
            if(path[i]) {
                matchPtr = this.#findMatch(matchPtr.par1.id) 
            } 
            else matchPtr = this.#findMatch(matchPtr.par2.id)
        }

        let roundIndex = this.findMatchRoundIndex(matchPtr.id)
        
        if(roundIndex === this.rounds.length - 1) {
            // add new round
            this.rounds.push(new Round(this.rounds[roundIndex].roundNum + 1))
        }

        roundIndex++ // change roundIndex to the index of the round that the match we are adding should be in

        let m
        if(path[path.length - 1]) {
            m = this.rounds[roundIndex].addMatch(matchPtr.par1, participant)
            matchPtr.par1 = new MatchReference(m.id)
        } else {
            m = this.rounds[roundIndex].addMatch(matchPtr.par2, participant)
            matchPtr.par2 = new MatchReference(m.id)
        }

        if(upperBracket !== undefined) {
            if(m.par1 instanceof MatchReference && participant.getLoser) {
                let upperRoundIndex = upperBracket.findMatchRoundIndex(m.par1.id)
                let upperRound = upperBracket.rounds[upperRoundIndex].roundNum
                let lowerRound = this.rounds[roundIndex].roundNum
                if(upperRound < lowerRound) upperBracket.shiftRounds(upperRoundIndex, lowerRound - upperRound)
            }
            if(m.par2 instanceof MatchReference && participant.getLoser) {
                let upperRound = upperBracket.rounds[upperBracket.findMatchRoundIndex(m.par2.id)].roundNum
                let lowerRound = this.rounds[roundIndex].roundNum
                if(upperRound < lowerRound) upperBracket.shiftRounds(upperRound, lowerRound - upperRound)
            }

        }

        return m
    }

    shiftRounds(start, amount) { // increment roundNum for every round from index start to index rounds.length - 1 by amount
        for(let i = start; i < this.rounds.length; i++) {
            this.rounds[i].roundNum += amount
        }
    }

    #findMatch(id) {
        let r = this.findMatchRoundIndex(id)
        if(r === undefined) return undefined
        return this.rounds[r].get(id)
    }

    findMatchRoundIndex(id) {
        for(let i = 0; i < this.rounds.length; i++) {
            if(this.rounds[i].get(id) !== undefined) return i
        }
        return undefined
    }

    getMaxRound() {
        let maxRound = 0
        this.rounds.forEach(r => maxRound = Math.max(maxRound, r.roundNum))

        return maxRound
    }

    getMaxRound() {
        let maxRound = 0
        this.rounds.forEach(r => maxRound = Math.max(maxRound, r.roundNum))

        return maxRound
    }

    flipRounds(numRounds) {
        this.rounds.forEach(r => {
            r.roundNum = numRounds - r.roundNum
            r.matches.forEach(m => m.round = r.roundNum)
        })
    }
}

class Round {
    matches // Map<String, Match>
    roundNum // int (first round in bracket will have the greatest roundNum)

    constructor(num) {
        this.matches = new Map()
        this.roundNum = num
    }

    addMatch(par1, par2) {
        let m = new Match(par1, par2)
        this.set(m.id, m)
        return m
    }

    get(id) {
        return this.matches.get(id)
    }

    set(id, match) {
        this.matches.set(id, match)
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
    round // int - gets initialized after the entire bracket is generated

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