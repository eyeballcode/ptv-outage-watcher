import fetchTown from './lib/fetch-page.mjs'

let daylesford = await fetchTown('mount buller')
console.log(daylesford)