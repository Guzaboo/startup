function losersBracketSequence(n) { // creates the sequence of 0's and 1's for each 5 <= s <= n where s is the seed of a team and the sequence of 0's and 1's represents the path to take from the 3rd vs 4th place match to find where to place the s-seeded team
    let c = [0]
    let res = []
    for(let i = 4; i < n; i++) {
        if(i === Math.pow(2, Math.floor(Math.log2(i))) + Math.pow(2, Math.floor(Math.log2(i)) - 1)) {
            c.push(0)
        }
        if(Number.isInteger(Math.log2(i))) {
            if(i !== 4) c.push(0)
            c[0] = (c[0] + 1) % 2
        }
        for(let j = 0; j < c.length; j += 2) {
            if(i % Math.pow(2, j / 2 + 1) === Math.pow(2, j / 2 + 1) / 2) c[j] = (c[j] + 1) % 2
        }
        res.push(JSON.parse(JSON.stringify(c)))
    }
    return res
}

function winnersBracketSequence(n) { // creates the sequence of 0's and 1's for each 3 <= s <= n where s is the seed of a team and the sequence of 0's and 1's represents the path to take from the 1st vs 2nd place match to find where to place the s-seeded team
    let c = []
    let res = []
    for(let i = 2; i < n; i++) {
        for(let j = 0; j < c.length; j ++) {
            if(i % Math.pow(2, j + 1) === Math.pow(2, j + 1) / 2) c[j] = (c[j] + 1) % 2
        }
        if(Number.isInteger(Math.log2(i))) {
            c.push(0)
        }
        res.push(JSON.parse(JSON.stringify(c)))
    }
    return res
}

console.log(...winnersBracketSequence(17))