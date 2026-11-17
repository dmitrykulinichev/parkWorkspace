#!/usr/bin/env node
// Озвучка дубля: node voice.mjs <тека> — кожна репліка (out/.marks.json) голосом Лесі (macOS `say`) на свій
// таймкод → out/voice.m4a і ролик з голосом out/video-voice.mp4. Інший голос — VOICE=… (`say -v '?'`).
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { execFileSync } from 'node:child_process'

const [dir] = process.argv.slice(2)
const voice = process.env.VOICE ?? 'Lesya'
const rate = process.env.RATE ?? '190' // швидкість `say` (слів/хв); Леся з паузами — ≈ 1,9 слова/с, як wordsPerSecond сценарію
const out = path.join(dir, 'out')
const { steps } = JSON.parse(fs.readFileSync(path.join(out, '.marks.json'), 'utf8'))
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'voice-'))

const inputs = []
const filters = []
steps.forEach((s, i) => {
  const file = path.join(tmp, `${s.id}.aiff`)
  execFileSync('say', ['-v', voice, '-r', rate, '-o', file, s.say])
  const seconds = Number(execFileSync('afinfo', [file]).toString().match(/estimated duration: ([\d.]+)/)?.[1] ?? 0)
  const windowS = (s.to - s.from) / 1000
  if (seconds > windowS) console.warn(`⚠ ${s.id}: репліка ${seconds.toFixed(1)} с довша за вікно ${windowS.toFixed(1)} с — заходить на наступний крок`)
  inputs.push('-i', file)
  filters.push(`[${i}:a]adelay=${Math.round(s.from)}|${Math.round(s.from)}[a${i}]`)
})
const mix = `${filters.join(';')};${steps.map((_, i) => `[a${i}]`).join('')}amix=inputs=${steps.length}:normalize=0[v]`
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...inputs, '-filter_complex', mix, '-map', '[v]', '-c:a', 'aac', '-b:a', '160k', path.join(out, 'voice.m4a')])
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', path.join(out, 'video.mp4'), '-i', path.join(out, 'voice.m4a'), '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'copy', '-shortest', path.join(out, 'video-voice.mp4')])
fs.rmSync(tmp, { recursive: true, force: true })
console.log(`out/voice.m4a, out/video-voice.mp4 — голос ${voice}`)
