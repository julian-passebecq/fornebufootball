export const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1wMiV-AvcqSl1-veRTurYb_24bplr3kKZGpmpSAr5cWs/edit'

const global7 = {
  standard: {
    title: { no: 'Standardplan', en: 'Standard plan' },
    sections: [
      { key: 'start', label: { no: 'Oppbygging', en: 'Build-up' }, text: { no: 'Spill oss ut bakfra med keeper som ekstra pasningspunkt. Hold bredde tidlig og finn fri spiller før vi fører ball.', en: 'Build from the back with the goalkeeper as an extra passing option. Create width early and find the free player before carrying the ball.' } },
      { key: 'attack', label: { no: 'Angrep', en: 'Attack' }, text: { no: 'Når vi kommer gjennom første press, gå fremover med fart. Ytre spillere holder bredde, mens spiss og midtbane fyller rom sentralt.', en: 'Once we beat the first press, attack forward with speed. Wide players keep width while the striker and midfielder occupy central spaces.' } },
      { key: 'defend', label: { no: 'Forsvar', en: 'Defend' }, text: { no: 'Vær kompakte mellom ball og mål. Før motstanderen ut mot sidelinjen og press sammen når første spiller går.', en: 'Stay compact between the ball and our goal. Show the opponent toward the touchline and press together when the first player steps out.' } },
      { key: 'transition', label: { no: 'Overgang', en: 'Transition' }, text: { no: 'Ved balltap: fem sekunder aggressivt gjenvinningspress. Hvis vi ikke vinner ballen, fall tilbake i formasjonen.', en: 'On losing the ball: five seconds of aggressive counter-pressing. If we do not win it, recover into our shape.' } },
    ]
  },
  alternative: {
    title: { no: 'Plan B – direkte', en: 'Plan B – direct' },
    sections: [
      { key: 'start', label: { no: 'Oppbygging', en: 'Build-up' }, text: { no: 'Hvis motstanderen presser høyt, spill tidligere over første press. Søk spiss eller bred spiller og vinn andreballen.', en: 'If the opponent presses high, play over the first line earlier. Find the striker or wide player and attack the second ball.' } },
      { key: 'attack', label: { no: 'Angrep', en: 'Attack' }, text: { no: 'Færre pasninger, mer løp fremover. Kom raskt til avslutning og fyll returområdet med to spillere.', en: 'Use fewer passes and more forward runs. Finish attacks quickly and send two players into the rebound area.' } },
      { key: 'defend', label: { no: 'Forsvar', en: 'Defend' }, text: { no: 'Lavere blokk og kortere avstander. Beskytt midten først, og la motstanderen ha ballen i ufarlige områder.', en: 'Defend in a lower block with shorter distances. Protect the centre first and allow possession in harmless areas.' } },
      { key: 'transition', label: { no: 'Overgang', en: 'Transition' }, text: { no: 'Første blikk fremover etter ballvinning. Hvis direkte løsning ikke er på, sikre ballen og bygg på nytt.', en: 'First look forward after regaining possession. If the direct option is not on, secure the ball and rebuild.' } },
    ]
  }
}

const global9 = {
  standard: {
    title: { no: 'Standardplan', en: 'Standard plan' },
    sections: [
      { key: 'start', label: { no: 'Oppbygging', en: 'Build-up' }, text: { no: 'Skap en tydelig treer i første fase og bruk keeper når nødvendig. Midtbanen viser seg i ulike høyder for å åpne pasningslinjer.', en: 'Create a clear first-line three and use the goalkeeper when needed. Midfielders show at different heights to open passing lanes.' } },
      { key: 'attack', label: { no: 'Angrep', en: 'Attack' }, text: { no: 'Strekk banen både i bredde og dybde. Når en kant går én-mot-én, fyller motsatt kant bakre stolpe.', en: 'Stretch the pitch in width and depth. When one winger attacks 1v1, the opposite winger attacks the far post.' } },
      { key: 'defend', label: { no: 'Forsvar', en: 'Defend' }, text: { no: 'Forsvar i tre tydelige ledd. Pressleder bestemmer retning, resten flytter samlet og stenger pasning inn sentralt.', en: 'Defend in three clear lines. The pressing player sets the direction, while the rest shift together and close central passes.' } },
      { key: 'transition', label: { no: 'Overgang', en: 'Transition' }, text: { no: 'Etter ballvinning: støtte under ball og én spiller truer bakrom umiddelbart.', en: 'After regaining possession: provide support underneath the ball while one player immediately threatens the space behind.' } },
    ]
  },
  alternative: {
    title: { no: 'Plan B – kontroll', en: 'Plan B – control' },
    sections: [
      { key: 'start', label: { no: 'Oppbygging', en: 'Build-up' }, text: { no: 'Prioriter sikker første pasning og behold ballen gjennom flere faser. Flytt motstanderen før vi spiller gjennom.', en: 'Prioritise the safe first pass and keep the ball through several phases. Move the opponent before playing through.' } },
      { key: 'attack', label: { no: 'Angrep', en: 'Attack' }, text: { no: 'Tålmodighet rundt boksen. Bytt side når det blir trangt og vent på riktig øyeblikk for gjennombrudd.', en: 'Be patient around the box. Switch play when it becomes crowded and wait for the right moment to penetrate.' } },
      { key: 'defend', label: { no: 'Forsvar', en: 'Defend' }, text: { no: 'Hold laget kompakt og unngå unødvendige dueller langt fra eget mål. Styr spillet dit vi har overtall.', en: 'Keep the team compact and avoid unnecessary duels far from our goal. Guide play toward areas where we have numerical superiority.' } },
      { key: 'transition', label: { no: 'Overgang', en: 'Transition' }, text: { no: 'Ved balltap prioriter balanse og sikring før vi presser. Nærmeste spiller bremser kontringen.', en: 'On losing the ball, prioritise balance and cover before pressing. The nearest player delays the counterattack.' } },
    ]
  }
}

const p = (number, roleNo, roleEn, x, y, possessionNo, possessionEn, defenceNo, defenceEn, transitionNo, transitionEn, cueNo, cueEn) => ({
  number,
  role: { no: roleNo, en: roleEn },
  x, y,
  sections: [
    { key: 'possession', label: { no: 'Med ball', en: 'In possession' }, text: { no: possessionNo, en: possessionEn } },
    { key: 'defence', label: { no: 'Uten ball', en: 'Out of possession' }, text: { no: defenceNo, en: defenceEn } },
    { key: 'transition', label: { no: 'Overgang', en: 'Transition' }, text: { no: transitionNo, en: transitionEn } },
    { key: 'cue', label: { no: 'Husk', en: 'Key cue' }, text: { no: cueNo, en: cueEn } },
  ]
})

export const seedData = {
  version: 2,
  '7v7': {
    label: '7v7',
    shape: '2-3-1',
    global: global7,
    players: [
      p(1, 'Keeper', 'Goalkeeper', 10, 50, 'Vær rolig med ballen og bruk begge sider.', 'Stay calm on the ball and use both sides.', 'Stå høyt nok til å støtte bakrommet.', 'Hold a high enough position to protect the space behind.', 'Etter redning: se raskt etter trygg igangsetting.', 'After a save: quickly look for a safe restart.', 'Snakk hele tiden.', 'Communicate constantly.'),
      p(2, 'Venstre forsvar', 'Left defender', 29, 34, 'Gi bredde i oppbyggingen og spill frem når linjen åpner seg.', 'Provide width in build-up and play forward when the line opens.', 'Vinn innsiden først og styr utover.', 'Protect the inside first and show outside.', 'Sprint tilbake på innsiden av ballen.', 'Recover inside the ball at speed.', 'Se opp før førsteberøring.', 'Scan before your first touch.'),
      p(3, 'Høyre forsvar', 'Right defender', 29, 66, 'Vær tilgjengelig under ball og våg å føre frem.', 'Be available underneath the ball and carry forward when space opens.', 'Hold avstand til partner og sikre bak.', 'Keep distance to your partner and provide cover.', 'Første løp hjemover, deretter organisere.', 'First run back, then organise.', 'Kroppen åpen mot banen.', 'Keep your body open to the pitch.'),
      p(4, 'Sentral midtbane', 'Central midfielder', 49, 50, 'Vis deg mellom ledd og spill på få touch når mulig.', 'Show between the lines and play with few touches when possible.', 'Skjerm midten og hjelp presset til riktig side.', 'Screen the centre and help direct the press.', 'Reager først – vinn andreball eller steng kontring.', 'React first – win the second ball or stop the counter.', 'Sjekk skuldrene ofte.', 'Check your shoulders often.'),
      p(5, 'Venstre kant', 'Left winger', 59, 18, 'Start bredt, utfordre fremover og kom inn i boksen på motsatt side.', 'Start wide, attack forward and enter the box when play is on the opposite side.', 'Press bakfra og inn for å låse sidelinjen.', 'Press from outside-in to lock play near the touchline.', 'Ved ballvinning: løp frem eller gi umiddelbar støtte.', 'On regain: run forward or give immediate support.', 'Bredde først, så dybde.', 'Width first, then depth.'),
      p(6, 'Høyre kant', 'Right winger', 59, 82, 'Hold bredde og se etter veggspill med spiss.', 'Keep width and look for combinations with the striker.', 'Jobb hjem til riktig side av ballen.', 'Recover to the correct side of the ball.', 'Angrip bakrom raskt når vi vinner ballen.', 'Attack the space behind quickly when we regain possession.', 'Første tanke fremover.', 'First thought forward.'),
      p(7, 'Spiss', 'Striker', 69, 50, 'Vær spillbar mellom og bak forsvarerne. Avslutt når muligheten kommer.', 'Be available between and behind defenders. Finish when the chance appears.', 'Start presset og vis motstanderen mot én side.', 'Start the press and force the opponent toward one side.', 'Etter ballvinning: sikre første pasning eller tru bakrom.', 'After regain: secure the first pass or threaten in behind.', 'Beveg deg etter pasning.', 'Move after passing.'),
    ]
  },
  '9v9': {
    label: '9v9',
    shape: '3-2-3',
    global: global9,
    players: [
      p(1, 'Keeper', 'Goalkeeper', 8, 50, 'Start angrep med ro og se etter overtall.', 'Start attacks calmly and look for numerical superiority.', 'Organiser bakre ledd og stå klart for gjennomspill.', 'Organise the back line and be ready for through balls.', 'Etter redning: vurder rask kontra eller kontroll.', 'After a save: assess quick counter versus controlled restart.', 'Vær lagets stemme bakfra.', 'Be the team voice from the back.'),
      p(2, 'Venstre forsvar', 'Left defender', 26, 27, 'Gi bredde tidlig og spill frem når rommet åpner seg.', 'Provide early width and play forward when the lane opens.', 'Steng innsiden og press utover.', 'Close the inside and press outside.', 'Sprint tilbake på innsiden av ballen.', 'Recover inside the ball at speed.', 'Se opp før førsteberøring.', 'Scan before your first touch.'),
      p(3, 'Midtstopper', 'Centre-back', 26, 50, 'Spill gjennom ledd når du kan, ellers flytt ballen raskt.', 'Play through lines when possible, otherwise move the ball quickly.', 'Hold linjen og kontroller rommet foran keeper.', 'Hold the line and control the space in front of the goalkeeper.', 'Sikre første kontringsløp.', 'Secure the first counterattacking run.', 'Snakk med begge forsvarerne.', 'Talk to both defenders.'),
      p(4, 'Høyre forsvar', 'Right defender', 26, 73, 'Vær et sikkert pasningspunkt og før frem i ledig rom.', 'Be a secure passing option and carry into open space.', 'Vinn innsiden først og støtt midtstopperen.', 'Protect the inside first and support the centre-back.', 'Første løp hjemover, så organiser.', 'Recover first, then organise.', 'Kroppen åpen mot banen.', 'Keep your body open to the pitch.'),
      p(5, 'Venstre midtbane', 'Left midfielder', 46, 38, 'Vis deg mellom pressledd og vend spillet når én side er full.', 'Show between pressure lines and switch when one side is crowded.', 'Skjerm sentralt og støtt første press.', 'Screen centrally and support the first press.', 'Vær først på andreball.', 'Be first to the second ball.', 'Skann før mottak.', 'Scan before receiving.'),
      p(6, 'Høyre midtbane', 'Right midfielder', 46, 62, 'Spill frem på få touch når du kan og støtt under ball.', 'Play forward with few touches when possible and support underneath the ball.', 'Hold avstand til den andre midtbanespilleren og steng sentralt.', 'Keep the correct distance to the other midfielder and close the centre.', 'Reager raskt på balltap.', 'React quickly when possession is lost.', 'Se begge sider før du mottar.', 'Scan both sides before receiving.'),
      p(7, 'Venstre kant', 'Left winger', 68, 25, 'Utfordre 1v1 og angrip bakre stolpe når ballen er på motsatt side.', 'Attack 1v1 and arrive at the far post when the ball is on the opposite side.', 'Fall ned i riktig høyde og hjelp forsvareren.', 'Recover to the right height and help the defender.', 'Første løp i bakrom.', 'First run threatens in behind.', 'Bredde til rett tid.', 'Width at the right time.'),
      p(8, 'Spiss', 'Striker', 70, 50, 'Bind midtstopperen og vær tydelig i boksen.', 'Occupy the centre-back and be decisive in the box.', 'Led presset og gjør banen smal.', 'Lead the press and make the pitch narrow.', 'Hold ballen hvis du er alene, angrip bakrom når støtte kommer.', 'Hold the ball if isolated; attack in behind when support arrives.', 'Vær foran mål når innlegget kommer.', 'Be in front of goal when the cross arrives.'),
      p(9, 'Høyre kant', 'Right winger', 68, 75, 'Hold bredde og angrip innsiden når spissen binder midten.', 'Keep width and attack inside when the striker pins the centre.', 'Jobb hjem til riktig side og steng pasning fremover.', 'Recover goal-side and close the forward passing lane.', 'Ved ballvinning: første løp fremover.', 'On regain: make the first run forward.', 'Bredde først, så gjennombrudd.', 'Width first, then penetrate.'),
    ]
  }
}
