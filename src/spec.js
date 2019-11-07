const Application = require('spectron').Application;
const chai = require('chai');
const expect = chai.expect;

/**
 * FuzeLite should be built with USE_NODE_INTEGRATION set to true
 */

describe('App launch', function () {
    this.timeout(100000);

    before(async function () {
        this.app = new Application({
            path: '/Applications/Fuze Join.app/Contents/MacOS/Fuze Join',
            args: ['--skipUpdates'],
            requireName: 'electronRequire'
        });

        return await this.app.start();
    });

    after(function () {
        if (this.app && this.app.isRunning()) {
            return this.app.stop()
        }
    });

    it('should load only one window', async function () {
        expect(await this.app.client.getWindowCount()).to.equal(1);
    });

    it('should have the correct title', async function () {
        const title = await this.app.client.waitUntilWindowLoaded().getTitle();
        return expect(title).to.equal('Fuze Join');
    });

    it('should go to guest page', async function () {
        const joinMeetingText = await this.app.client
            .waitUntilWindowLoaded()
            .waitUntil(() => {
                return this.app.client.getText('.td-auth-title');
            }, 5000, 'Not on guest page')
            .getText('.td-auth-title');

        expect(joinMeetingText).to.equal('Join Meeting');
    });
});

describe.only('Join Meeting', function () {
    this.timeout(200000);

    before(async function () {
        this.app = new Application({
            path: '/Applications/Fuze Join.app/Contents/MacOS/Fuze Join',
            args: ['--skipUpdates'],
            requireName: 'electronRequire'
        });

        return await this.app.start();
    });

    after(function () {
        if (this.app && this.app.isRunning()) {
            return this.app.stop()
        }
    });

    it('should go to guest page', async function () {
        // https://stackoverflow.com/questions/46676170/testing-text-input-for-electron-app

        const selectors = {
            nextBtn: 'button.tc-button.tc-button-primary.tc-button-text.tc-button-big',
            joinBtn: 'div.text-center>button'
        };

        await this.app.client
            .waitUntilWindowLoaded()
            .waitUntil(() => {
                console.log('Inserting meeting id...');
                return this.app.client.click('#tdGuestMeetingIDInput');
            })
            .click('#tdGuestMeetingIDInput')
            .keys('34982631')
            .element('.td-auth-title').click()
            .element(selectors.nextBtn).click()
            .waitUntil(() => {
                console.log('Inserting guest name...')
                return this.app.client.element('#tdGuestNameInput').click();
            })
            .keys('John Doe')
            .element('.td-auth-title').click() // blur the input element
            .element(selectors.joinBtn).click()
            .waitUntilWindowLoaded();

        return await this.app.client
            .waitUntilWindowLoaded()
            .waitUntil(() => {
                console.log('submit av settings...');
                return this.app.client.click('button[type=submit]').click();
            })
    });


    it.only('should go to guest page', async function () {
        // https://stackoverflow.com/questions/46676170/testing-text-input-for-electron-app

        const selectors = {
            nextBtn: 'button.tc-button.tc-button-primary.tc-button-text.tc-button-big',
            joinBtn: 'div.text-center>button'
        };

        await this.app.client
            .waitUntilWindowLoaded()
            .waitUntil(() => {
                console.log('Inserting meeting id...');
                return this.app.client.click('#tdGuestMeetingIDInput');
            })
            .click('#tdGuestMeetingIDInput')
            .keys('34982631')
            .element('.td-auth-title').click();

        await this.app.client.element(selectors.nextBtn).click()
            .waitUntil(() => {
                console.log('Inserting guest name...')
                return this.app.client.element('#tdGuestNameInput').click();
            })
            .keys('John Doe')
            .element('.td-auth-title').click(); // blur the input element

        await this.app.client.element(selectors.joinBtn).click();

        this.app.client.pause(5000);




        // wait until entering av setting modal...
        await this.app.client
            .waitUntilWindowLoaded()
            .waitUntil(() => {
                console.log('submit av settings...');
                return this.app.client.click('button[type=submit]._submit');
            }, 5000)
            .then(async () => {
                console.log('found submit...', await this.app.client.element('button[type=submit]._submit').getText());
                return await this.app.client.element('button[type=submit]._submit').click();
            });

        // wait for green room...
        return await this.app.client
            .waitUntilWindowLoaded()
            .waitUntil(() => {
                console.log('waiting for green room')
                //fuze-springmedia tb-springmedia-fullscreen
                return this.app.client.element('.fuze-springmedia.tb-springmedia-fullscreen').isVisible();

            }, 10000).then(() => {
                console.log('Entered green room....');
                expect(true).to.equal(true);
            })
    });
});





