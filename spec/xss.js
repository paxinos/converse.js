(function (root, factory) {
    define(["jasmine", "mock", "test-utils" ], factory);
} (this, function (jasmine, mock, test_utils) {
    const $pres = converse.env.$pres;
    const sizzle = converse.env.sizzle;
    const u = converse.env.utils;

    describe("XSS", function () {
        describe("A Chat Message", function () {

            it("will escape IMG payload XSS attempts",
                mock.initConverse(
                    ['rosterGroupsFetched', 'chatBoxesFetched'], {},
                    async function (done, _converse) {

                spyOn(window, 'alert').and.callThrough();
                await test_utils.waitForRoster(_converse, 'current');
                await test_utils.openControlBox(_converse);

                const contact_jid = mock.cur_names[0].replace(/ /g,'.').toLowerCase() + '@montague.lit';
                await test_utils.openChatBoxFor(_converse, contact_jid)
                const view = _converse.api.chatviews.get(contact_jid);

                let message = "<img src=x onerror=alert('XSS');>";
                await test_utils.sendMessage(view, message);
                let msg = sizzle('.chat-content .chat-msg:last .chat-msg__text', view.el).pop();
                expect(msg.textContent).toEqual(message);
                expect(msg.innerHTML).toEqual("&lt;img src=x onerror=alert('XSS');&gt;");
                expect(window.alert).not.toHaveBeenCalled();

                message = "<img src=x onerror=alert('XSS')//";
                await test_utils.sendMessage(view, message);
                msg = sizzle('.chat-content .chat-msg:last .chat-msg__text', view.el).pop();
                expect(msg.textContent).toEqual(message);
                expect(msg.innerHTML).toEqual("&lt;img src=x onerror=alert('XSS')//");

                message = "<img src=x onerror=alert(String.fromCharCode(88,83,83));>";
                await test_utils.sendMessage(view, message);
                msg = sizzle('.chat-content .chat-msg:last .chat-msg__text', view.el).pop();
                expect(msg.textContent).toEqual(message);
                expect(msg.innerHTML).toEqual("&lt;img src=x onerror=alert(String.fromCharCode(88,83,83));&gt;");

                message = "<img src=x oneonerrorrror=alert(String.fromCharCode(88,83,83));>";
                await test_utils.sendMessage(view, message);
                msg = sizzle('.chat-content .chat-msg:last .chat-msg__text', view.el).pop();
                expect(msg.textContent).toEqual(message);
                expect(msg.innerHTML).toEqual("&lt;img src=x oneonerrorrror=alert(String.fromCharCode(88,83,83));&gt;");

                message = "<img src=x:alert(alt) onerror=eval(src) alt=xss>";
                await test_utils.sendMessage(view, message);
                msg = sizzle('.chat-content .chat-msg:last .chat-msg__text', view.el).pop();
                expect(msg.textContent).toEqual(message);
                expect(msg.innerHTML).toEqual("&lt;img src=x:alert(alt) onerror=eval(src) alt=xss&gt;");

                message = "><img src=x onerror=alert('XSS');>";
                await test_utils.sendMessage(view, message);
                msg = sizzle('.chat-content .chat-msg:last .chat-msg__text', view.el).pop();
                expect(msg.textContent).toEqual(message);
                expect(msg.innerHTML).toEqual("&gt;&lt;img src=x onerror=alert('XSS');&gt;");

                message = "><img src=x onerror=alert(String.fromCharCode(88,83,83));>";
                await test_utils.sendMessage(view, message);
                msg = sizzle('.chat-content .chat-msg:last .chat-msg__text', view.el).pop();
                expect(msg.textContent).toEqual(message);
                expect(msg.innerHTML).toEqual("&gt;&lt;img src=x onerror=alert(String.fromCharCode(88,83,83));&gt;");

                expect(window.alert).not.toHaveBeenCalled();
                done();
            }));

            it("will escape SVG payload XSS attempts",
                mock.initConverse(
                    ['rosterGroupsFetched', 'chatBoxesFetched'], {},
                    async function (done, _converse) {

                spyOn(window, 'alert').and.callThrough();
                await test_utils.waitForRoster(_converse, 'current');
                await test_utils.openControlBox(_converse);

                const contact_jid = mock.cur_names[0].replace(/ /g,'.').toLowerCase() + '@montague.lit';
                await test_utils.openChatBoxFor(_converse, contact_jid)
                const view = _converse.api.chatviews.get(contact_jid);

                let message = "<svgonload=alert(1)>";
                await test_utils.sendMessage(view, message);
                let msg = sizzle('.chat-content .chat-msg:last .chat-msg__text', view.el).pop();
                expect(msg.textContent).toEqual(message);
                expect(msg.innerHTML).toEqual('&lt;svgonload=alert(1)&gt;');

                message = "<svg/onload=alert('XSS')>";
                await test_utils.sendMessage(view, message);
                msg = sizzle('.chat-content .chat-msg:last .chat-msg__text', view.el).pop();
                expect(msg.textContent).toEqual(message);
                expect(msg.innerHTML).toEqual("&lt;svg/onload=alert('XSS')&gt;");

                message = "<svg onload=alert(1)//";
                await test_utils.sendMessage(view, message);
                msg = sizzle('.chat-content .chat-msg:last .chat-msg__text', view.el).pop();
                expect(msg.textContent).toEqual(message);
                expect(msg.innerHTML).toEqual("&lt;svg onload=alert(1)//");

                message = "<svg/onload=alert(String.fromCharCode(88,83,83))>";
                await test_utils.sendMessage(view, message);
                msg = sizzle('.chat-content .chat-msg:last .chat-msg__text', view.el).pop();
                expect(msg.textContent).toEqual(message);
                expect(msg.innerHTML).toEqual("&lt;svg/onload=alert(String.fromCharCode(88,83,83))&gt;");

                message = "<svg id=alert(1) onload=eval(id)>";
                await test_utils.sendMessage(view, message);
                msg = sizzle('.chat-content .chat-msg:last .chat-msg__text', view.el).pop();
                expect(msg.textContent).toEqual(message);
                expect(msg.innerHTML).toEqual("&lt;svg id=alert(1) onload=eval(id)&gt;");

                message = '"><svg/onload=alert(String.fromCharCode(88,83,83))>';
                await test_utils.sendMessage(view, message);
                msg = sizzle('.chat-content .chat-msg:last .chat-msg__text', view.el).pop();
                expect(msg.textContent).toEqual(message);
                expect(msg.innerHTML).toEqual('"&gt;&lt;svg/onload=alert(String.fromCharCode(88,83,83))&gt;');

                message = '"><svg/onload=alert(/XSS/)';
                await test_utils.sendMessage(view, message);
                msg = sizzle('.chat-content .chat-msg:last .chat-msg__text', view.el).pop();
                expect(msg.textContent).toEqual(message);
                expect(msg.innerHTML).toEqual('"&gt;&lt;svg/onload=alert(/XSS/)');

                expect(window.alert).not.toHaveBeenCalled();
                done();
            }));

            it("will have properly escaped URLs",
                mock.initConverse(
                    ['rosterGroupsFetched', 'chatBoxesFetched'], {},
                    async function (done, _converse) {

                await test_utils.waitForRoster(_converse, 'current');
                await test_utils.openControlBox(_converse);

                const contact_jid = mock.cur_names[0].replace(/ /g,'.').toLowerCase() + '@montague.lit';
                await test_utils.openChatBoxFor(_converse, contact_jid)
                const view = _converse.api.chatviews.get(contact_jid);

                let message = "http://www.opkode.com/'onmouseover='alert(1)'whatever";
                await test_utils.sendMessage(view, message);

                let msg = sizzle('.chat-content .chat-msg:last .chat-msg__text', view.el).pop();
                expect(msg.textContent).toEqual(message);
                expect(msg.innerHTML)
                    .toEqual('<a target="_blank" rel="noopener" href="http://www.opkode.com/%27onmouseover=%27alert%281%29%27whatever">http://www.opkode.com/\'onmouseover=\'alert(1)\'whatever</a>');

                message = 'http://www.opkode.com/"onmouseover="alert(1)"whatever';
                await test_utils.sendMessage(view, message);

                msg = sizzle('.chat-content .chat-msg:last .chat-msg__text', view.el).pop();
                expect(msg.textContent).toEqual(message);
                expect(msg.innerHTML).toEqual('<a target="_blank" rel="noopener" href="http://www.opkode.com/%22onmouseover=%22alert%281%29%22whatever">http://www.opkode.com/"onmouseover="alert(1)"whatever</a>');

                message = "https://en.wikipedia.org/wiki/Ender's_Game";
                await test_utils.sendMessage(view, message);

                msg = sizzle('.chat-content .chat-msg:last .chat-msg__text', view.el).pop();
                expect(msg.textContent).toEqual(message);
                expect(msg.innerHTML).toEqual('<a target="_blank" rel="noopener" href="https://en.wikipedia.org/wiki/Ender%27s_Game">'+message+'</a>');

                message = "<https://bugs.documentfoundation.org/show_bug.cgi?id=123737>";
                await test_utils.sendMessage(view, message);

                msg = sizzle('.chat-content .chat-msg:last .chat-msg__text', view.el).pop();
                expect(msg.textContent).toEqual(message);
                expect(msg.innerHTML).toEqual(
                    `&lt;<a target="_blank" rel="noopener" href="https://bugs.documentfoundation.org/show_bug.cgi?id=123737">https://bugs.documentfoundation.org/show_bug.cgi?id=123737</a>&gt;`);

                message = '<http://www.opkode.com/"onmouseover="alert(1)"whatever>';
                await test_utils.sendMessage(view, message);

                msg = sizzle('.chat-content .chat-msg:last .chat-msg__text', view.el).pop();
                expect(msg.textContent).toEqual(message);
                expect(msg.innerHTML).toEqual(
                    '&lt;<a target="_blank" rel="noopener" href="http://www.opkode.com/%22onmouseover=%22alert%281%29%22whatever">http://www.opkode.com/"onmouseover="alert(1)"whatever</a>&gt;');

                message = `https://www.google.com/maps/place/Kochstraat+6,+2041+CE+Zandvoort/@52.3775999,4.548971,3a,15y,170.85h,88.39t/data=!3m6!1e1!3m4!1sQ7SdHo_bPLPlLlU8GSGWaQ!2e0!7i13312!8i6656!4m5!3m4!1s0x47c5ec1e56f845ad:0x1de0bc4a5771fb08!8m2!3d52.3773668!4d4.5489388!5m1!1e2`
                await test_utils.sendMessage(view, message);

                msg = sizzle('.chat-content .chat-msg:last .chat-msg__text', view.el).pop();
                expect(msg.textContent).toEqual(message);
                expect(msg.innerHTML).toEqual(
                    `<a target="_blank" rel="noopener" href="https://www.google.com/maps/place/Kochstraat+6,+2041+CE+Zandvoort/@52.3775999,4.548971,3a,15y,170.85h,88.39t/data=%213m6%211e1%213m4%211sQ7SdHo_bPLPlLlU8GSGWaQ%212e0%217i13312%218i6656%214m5%213m4%211s0x47c5ec1e56f845ad:0x1de0bc4a5771fb08%218m2%213d52.3773668%214d4.5489388%215m1%211e2">https://www.google.com/maps/place/Kochstraat+6,+2041+CE+Zandvoort/@52.3775999,4.548971,3a,15y,170.85h,88.39t/data=!3m6!1e1!3m4!1sQ7SdHo_bPLPlLlU8GSGWaQ!2e0!7i13312!8i6656!4m5!3m4!1s0x47c5ec1e56f845ad:0x1de0bc4a5771fb08!8m2!3d52.3773668!4d4.5489388!5m1!1e2</a>`);
                done();
            }));
        });

        describe("A Groupchat", function () {

            it("escapes occupant nicknames when rendering them, to avoid JS-injection attacks",
                    mock.initConverse(['rosterGroupsFetched'], {},
                    async function (done, _converse) {

                await test_utils.openAndEnterChatRoom(_converse, 'lounge@montague.lit', 'romeo');
                /* <presence xmlns="jabber:client" to="jc@chat.example.org/converse.js-17184538"
                    *      from="oo@conference.chat.example.org/&lt;img src=&quot;x&quot; onerror=&quot;alert(123)&quot;/&gt;">
                    *   <x xmlns="http://jabber.org/protocol/muc#user">
                    *    <item jid="jc@chat.example.org/converse.js-17184538" affiliation="owner" role="moderator"/>
                    *    <status code="110"/>
                    *   </x>
                    * </presence>"
                    */
                const presence = $pres({
                        to:'romeo@montague.lit/pda',
                        from:"lounge@montague.lit/&lt;img src=&quot;x&quot; onerror=&quot;alert(123)&quot;/&gt;"
                }).c('x').attrs({xmlns:'http://jabber.org/protocol/muc#user'})
                    .c('item').attrs({
                        jid: 'someone@montague.lit',
                        role: 'moderator',
                    }).up()
                    .c('status').attrs({code:'110'}).nodeTree;

                _converse.connection._dataRecv(test_utils.createRequest(presence));
                const view = _converse.chatboxviews.get('lounge@montague.lit');
                await u.waitUntil(() => view.el.querySelectorAll('li .occupant-nick').length, 500);
                const occupants = view.el.querySelector('.occupant-list').querySelectorAll('li .occupant-nick');
                expect(occupants.length).toBe(2);
                expect(occupants[0].textContent.trim()).toBe("&lt;img src=&quot;x&quot; onerror=&quot;alert(123)&quot;/&gt;");
                done();
            }));

            it("escapes the subject before rendering it, to avoid JS-injection attacks",
                mock.initConverse(
                    ['rosterGroupsFetched'], {},
                    async function (done, _converse) {

                await test_utils.openAndEnterChatRoom(_converse, 'jdev@conference.jabber.org', 'jc');
                spyOn(window, 'alert');
                const subject = '<img src="x" onerror="alert(\'XSS\');"/>';
                const view = _converse.chatboxviews.get('jdev@conference.jabber.org');
                view.model.set({'subject': {
                    'text': subject,
                    'author': 'ralphm'
                }});
                expect(sizzle('.chat-event:last').pop().textContent.trim()).toBe('Topic set by ralphm');
                const desc = await u.waitUntil(() => view.el.querySelector('.chat-head__desc'));
                expect(desc.textContent.trim()).toBe(subject);
                done();
            }));
        });
    });
}));
