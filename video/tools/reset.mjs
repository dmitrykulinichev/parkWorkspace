#!/usr/bin/env node
// Повернути героя в стан "без авто" перед записом: node reset.mjs — якщо авто прийняте, здати його
// (той самий пробіг, що підставлено). Виконавець — device.mjs.
import { launchApp, screen, tapOn, waitVisible } from './device.mjs'

await launchApp('ua.com.g24')
await waitVisible('Мій автомобіль', 30000)
if ((await screen()).some((n) => n.label === 'Здати автомобіль')) {
  await tapOn('Здати автомобіль')
  await waitVisible('Здача автомобіля')
  await tapOn('Здати автомобіль') // у вікні — лише його кнопка
  await waitVisible('Ви не у автомобілі', 15000)
  console.log('Авто здано — герой без авто')
} else {
  console.log('Авто вже не прийняте')
}
