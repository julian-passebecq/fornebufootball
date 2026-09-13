import { test, expect } from '@playwright/test'
import { normalizeBoard } from '../../src/boardModel.js'

async function fixture(page,{failSave=false,unauthorized=false,failLoad=false}={}) {
  let saved=normalizeBoard(), posts=[], nextFailure=failSave, expires=unauthorized
  page.on('dialog',dialog=>dialog.accept())
  const errors=[];page.on('pageerror',error=>errors.push(error.message))
  await page.route('**/api/tactics',async route=>{
    if(route.request().method()==='POST'){
      posts.push(route.request().postDataJSON())
      if(expires){expires=false;return route.fulfill({status:401,json:{error:'Unauthorized'}})}
      if(nextFailure){nextFailure=false;return route.fulfill({status:500,json:{error:'Test failure'}})}
      saved=route.request().postDataJSON();return route.fulfill({json:{ok:true}})
    }
    return route.fulfill({status:failLoad?503:200,json:failLoad?{error:'Unavailable'}:saved})
  })
  await page.route('**/api/coach-login',async route=>route.fulfill({json:{token:`${Date.now()+3600000}.${'b'.repeat(64)}`}}))
  await page.route('https://images.fotball.no/**',route=>route.abort())
  return {posts,errors,getSaved:()=>saved}
}
async function openCoach(page){await page.goto('/coach');await page.getByLabel('Mot de passe',{exact:true}).fill('test-only-password');await page.getByRole('button',{name:'Connexion',exact:true}).click();await expect(page.getByRole('button',{name:'VALIDER',exact:true})).toBeEnabled()}
async function selectPlayer(page,slot=7){await page.locator(`[data-player-slot="${slot}"]`).click();await expect(page.locator('.player-sidebar-head')).toBeVisible()}
async function assertLayout(page){
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1)).toBeTruthy()
  const controls=page.locator('.header-actions');await expect(controls).toBeVisible()
  const box=await controls.boundingBox();expect(box.x).toBeGreaterThanOrEqual(0);expect(box.x+box.width).toBeLessThanOrEqual(page.viewportSize().width+1)
  const p=await page.locator('.pitch').boundingBox()
  for(const marker of await page.locator('.player-marker').all()){const b=await marker.boundingBox();expect(b.x+b.width/2).toBeGreaterThan(p.x);expect(b.x+b.width/2).toBeLessThan(p.x+p.width);expect(b.y+b.height/2).toBeGreaterThan(p.y);expect(b.y+b.height/2).toBeLessThan(p.y+p.height)}
}

test('public layout, touch selection and single shared player page',async({page,isMobile},testInfo)=>{
 const ctx=await fixture(page);await page.goto('/');await expect(page.locator('.global-sections .strategy-block')).toHaveCount(4)
 await expect(page.locator('a[href="/coach"],.coach-entry-v14,.validate-button')).toHaveCount(0)
 await expect(page.locator('.format-selector button')).toHaveText(['7v7','9v9'])
 await expect(page.locator('.board-format-pill')).toHaveText('9v9');await assertLayout(page)
 await page.screenshot({path:testInfo.outputPath('public-initial.png'),fullPage:true})
 const marker=page.locator('[data-player-slot="7"]');if(isMobile)await marker.tap();else await marker.click()
 await expect(page.locator('.player-sidebar-head h2')).toHaveText('#7');await expect(page.locator('.strategy-toggle')).toHaveCount(0)
 const guidance=await page.locator('.player-topics').innerText();await page.locator('.back-team-button').click()
 await page.getByRole('button',{name:'On ball loss',exact:true}).click();await expect(page.locator('[data-section="withoutBall"]')).toBeVisible()
 await selectPlayer(page);expect(await page.locator('.player-topics').innerText()).toBe(guidance)
 await page.screenshot({path:testInfo.outputPath('public-player.png'),fullPage:true});expect(ctx.errors).toEqual([])
})

test('auto/manual orientation persists and works with 7v7 and 9v9',async({page},testInfo)=>{
 const ctx=await fixture(page);await page.goto('/');const view=page.getByLabel('Pitch view',{exact:true})
 const {width,height}=page.viewportSize();await expect(page.locator('.pitch')).toHaveAttribute('data-orientation',width<=1180&&height>width?'vertical':'horizontal')
 for(const orientation of ['vertical','horizontal']){await view.selectOption(orientation);await expect(page.locator('.pitch')).toHaveAttribute('data-orientation',orientation);await assertLayout(page);await page.screenshot({path:testInfo.outputPath(`${orientation}.png`),fullPage:true})}
 await page.reload();await expect(page.locator('.pitch')).toHaveAttribute('data-orientation','horizontal')
 await page.getByRole('button',{name:'7v7',exact:true}).click();await expect(page.locator('.player-marker')).toHaveCount(7)
 await view.selectOption('vertical');await assertLayout(page);expect(ctx.posts).toHaveLength(0);expect(ctx.errors).toEqual([])
})

test('coach starts French, one green save at left, English/Norwegian are read-only',async({page},testInfo)=>{
 const ctx=await fixture(page);await openCoach(page)
 await expect(page.locator('html')).toHaveAttribute('lang','fr');await expect(page.locator('.language-switch button')).toHaveText(['FR','EN','NO'])
 await expect(page.locator('.validate-button')).toHaveCount(1);await expect(page.locator('.coach-footer,.coach-entry-v14')).toHaveCount(0)
 const val=await page.locator('.validate-button').boundingBox(),fr=await page.getByRole('button',{name:'FR',exact:true}).boundingBox();expect(val.x+val.width).toBeLessThanOrEqual(fr.x)
 await expect(page.locator('[data-section="defend"]')).toHaveCount(0)
 await page.locator('.editable-field textarea').first().fill('Texte français conservé')
 for(const lang of ['EN','NO']){await page.getByRole('button',{name:lang,exact:true}).click();await expect(page.locator('.editable-field textarea').first()).toHaveAttribute('readonly','');await expect(page.locator('.validate-button')).toBeDisabled();await expect(page.locator('.player-marker.draggable')).toHaveCount(0)}
 await page.getByRole('button',{name:'FR',exact:true}).click();await expect(page.locator('.editable-field textarea').first()).toHaveValue('Texte français conservé');await expect(page.locator('.validate-button')).toBeEnabled()
 await assertLayout(page);await page.screenshot({path:testInfo.outputPath('coach.png'),fullPage:true});expect(ctx.errors).toEqual([])
})

test('coach can renumber, reject duplicates, swap, and publish without moving other players',async({page})=>{
 const ctx=await fixture(page);await openCoach(page);await selectPlayer(page)
 const start=await page.locator('[data-player-slot="7"]').getAttribute('style')
 await page.getByLabel('Numéro du maillot',{exact:true}).fill('17');await page.getByRole('button',{name:'Appliquer',exact:true}).click()
 await expect(page.locator('.player-sidebar-head h2')).toHaveText('#17');expect(await page.locator('[data-player-slot="7"]').getAttribute('style')).toBe(start)
 await page.getByLabel('Numéro du maillot',{exact:true}).fill('2');await page.getByRole('button',{name:'Appliquer',exact:true}).click();await expect(page.getByRole('alert')).toContainText('déjà utilisé')
 await page.getByRole('button',{name:'Échanger #17 / #2',exact:true}).click();await expect(page.locator('.player-sidebar-head h2')).toHaveText('#2')
 await page.getByRole('button',{name:'VALIDER',exact:true}).click();await expect(page.getByRole('button',{name:'VALIDÉ ✓',exact:true})).toBeVisible()
 expect(ctx.posts).toHaveLength(1);for(const phase of ['standard','alternative']){expect(ctx.posts[0].formats['9v9'].tactics[phase].players[6].shirtNumber).toBe(2);expect(ctx.posts[0].formats['9v9'].tactics[phase].players[1].shirtNumber).toBe(17)}
 await page.reload();await selectPlayer(page);await expect(page.locator('.player-sidebar-head h2')).toHaveText('#2');expect(ctx.errors).toEqual([])
})

test('vertical drag maps to stored coordinates and undo restores a single phase',async({page})=>{
 const ctx=await fixture(page);await openCoach(page);await page.getByLabel('Vue du terrain',{exact:true}).selectOption('vertical')
 const marker=page.locator('[data-player-slot="7"]');await marker.scrollIntoViewIfNeeded();const old=await marker.getAttribute('style');let b=await marker.boundingBox()
 await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();await page.mouse.move(b.x+b.width/2+30,b.y+b.height/2-45,{steps:8});await page.mouse.up();await expect(marker).not.toHaveAttribute('style',old)
 await page.getByRole('button',{name:'VALIDER',exact:true}).click();await expect(page.getByRole('button',{name:'VALIDÉ ✓',exact:true})).toBeVisible()
 const published=ctx.posts[0].formats['9v9'];expect(published.tactics.standard.players[6].x).toBeGreaterThan(68);expect(published.tactics.standard.players[6].y).toBeGreaterThan(25);expect(published.tactics.alternative.players[6].x).toBe(66)
 await page.getByRole('button',{name:'Annuler',exact:true}).click();await expect(marker).toHaveAttribute('style',old)
 expect(ctx.errors).toEqual([])
})

test('French role/instructions are shared while phase position edits are independent',async({page})=>{
 const ctx=await fixture(page);await openCoach(page);await selectPlayer(page)
 await page.getByLabel('Rôle (FR)',{exact:true}).fill('Ailier du coach')
 await page.getByRole('textbox',{name:'Attaque',exact:true}).fill('Consigne unique dans les deux phases.')
 await page.locator('.back-team-button').click();await page.getByRole('button',{name:'À la perte de balle',exact:true}).click();await selectPlayer(page)
 await expect(page.getByRole('textbox',{name:'Attaque',exact:true})).toHaveValue('Consigne unique dans les deux phases.')
 await page.getByRole('button',{name:'Déplacer up',exact:true}).click();await page.getByRole('button',{name:'VALIDER',exact:true}).click()
 await expect(page.getByRole('button',{name:'VALIDÉ ✓',exact:true})).toBeVisible();expect(ctx.posts).toHaveLength(1);expect(ctx.errors).toEqual([])
})

test('save failures remain visible; retry saves; expired session preserves draft',async({page})=>{
 const ctx=await fixture(page,{failSave:true,unauthorized:true});await openCoach(page)
 await page.locator('.editable-field textarea').first().fill('Ne pas perdre cette modification.')
 await page.getByRole('button',{name:'VALIDER',exact:true}).click();await expect(page.getByLabel('Mot de passe',{exact:true})).toBeVisible()
 await page.getByLabel('Mot de passe',{exact:true}).fill('test-only-password');await page.getByRole('button',{name:'Connexion',exact:true}).click()
 await expect(page.locator('.editable-field textarea').first()).toHaveValue('Ne pas perdre cette modification.')
 await page.getByRole('button',{name:'VALIDER',exact:true}).click();await expect(page.getByRole('alert')).toContainText('Publication impossible')
 await page.getByRole('button',{name:'VALIDER',exact:true}).click();await expect(page.getByRole('button',{name:'VALIDÉ ✓',exact:true})).toBeVisible();expect(ctx.posts).toHaveLength(3);expect(ctx.errors).toEqual([])
})

test('unpublished draft survives refresh without changing the public plan',async({page})=>{
 const ctx=await fixture(page);await openCoach(page);await page.locator('.editable-field textarea').first().fill('Brouillon non publié.')
 await page.waitForTimeout(400);await page.reload();await expect(page.locator('.editable-field textarea').first()).toHaveValue('Brouillon non publié.');expect(ctx.posts).toHaveLength(0)
 await page.goto('/');await expect(page.locator('.instruction-list').first()).not.toContainText('Brouillon non publié.');expect(ctx.errors).toEqual([])
})

test('failed initial load cannot overwrite published plans with seed data',async({page})=>{
 const ctx=await fixture(page,{failLoad:true});await page.goto('/coach');await page.getByLabel('Mot de passe',{exact:true}).fill('test');await page.getByRole('button',{name:'Connexion',exact:true}).click()
 await expect(page.getByRole('alert')).toContainText('Chargement impossible');await expect(page.locator('.validate-button')).toBeDisabled();await expect(page.locator('.editable-field textarea').first()).toHaveAttribute('readonly','');expect(ctx.posts).toHaveLength(0)
})

test('both presets compact and student controls remain clean after language/phase changes',async({page})=>{
 const ctx=await fixture(page);await openCoach(page);await page.getByRole('button',{name:'À la perte de balle',exact:true}).click()
 await expect(page.locator('.counterpress-preset-options button')).toHaveCount(2);await expect(page.locator('.counterpress-preset-options')).not.toContainText('Plus de joueurs')
 await page.locator('.counterpress-preset-options button').last().click();await expect(page.locator('.formation-center-badge strong')).toHaveText('2-3-3')
 await page.getByRole('button',{name:'7v7',exact:true}).click();await expect(page.locator('.player-marker')).toHaveCount(7)
 for(const lang of ['EN','NO','FR']){await page.getByRole('button',{name:lang,exact:true}).click();await assertLayout(page)}
 await page.goto('/');await expect(page.locator('.validate-button,a[href="/coach"],.coach-entry-v14')).toHaveCount(0);expect(ctx.errors).toEqual([])
})
