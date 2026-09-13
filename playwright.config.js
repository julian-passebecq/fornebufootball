import { defineConfig, devices } from '@playwright/test'
export default defineConfig({
  testDir:'./tests/browser', fullyParallel:true, timeout:35000, expect:{timeout:7000},
  workers:2, retries:0, reporter:[['list'],['html',{open:'never'}],['json',{outputFile:'test-results/results.json'}]],
  use:{baseURL:'http://127.0.0.1:4173',trace:'retain-on-failure',screenshot:'only-on-failure',reducedMotion:'reduce'},
  projects:[
    {name:'desktop-chromium',use:{browserName:'chromium',viewport:{width:1440,height:900}}},
    {name:'iphone-webkit',use:{...devices['iPhone 13'],browserName:'webkit'}},
    {name:'ipad-portrait-webkit',use:{...devices['iPad (gen 7)'],viewport:{width:820,height:1180},browserName:'webkit'}},
    {name:'ipad-landscape-chromium',use:{browserName:'chromium',viewport:{width:1180,height:820},hasTouch:true}},
  ],
  webServer:{command:'npm run preview -- --host 127.0.0.1 --port 4173',url:'http://127.0.0.1:4173',reuseExistingServer:!process.env.CI,timeout:30000},
})
