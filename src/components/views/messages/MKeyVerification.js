/*
Copyright 2015, 2016 OpenMarket Ltd

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import MatrixClientPeg from '../../../MatrixClientPeg';
import {verificationMethods} from 'matrix-js-sdk/lib/crypto';
import sdk from '../../../index';
import Modal from "../../../Modal";
import { _t } from '../../../languageHandler';

module.exports = createReactClass({
    displayName: 'TextualEvent',

    propTypes: {
        /* the MatrixEvent to show */
        mxEvent: PropTypes.object.isRequired,
    },

    _onAcceptClicked: function() {
        const IncomingSasDialog = sdk.getComponent('views.dialogs.IncomingSasDialog');
        // todo: validate event, for example if it has sas in the methods.
        const verifier = MatrixClientPeg.get().acceptVerificationDM(this.props.mxEvent, verificationMethods.SAS);
        Modal.createTrackedDialog('Incoming Verification', '', IncomingSasDialog, {
            verifier,
        });
    },

    render: function() {
        const {mxEvent} = this.props;
        const client = MatrixClientPeg.get();
        const myUserId = client.getUserId();
        const roomId = mxEvent.getRoomId();
        const room = client.getRoom(roomId);
        const userId = mxEvent.getSender();
        const isOwn = userId === myUserId;
        const name = mxEvent.sender ? mxEvent.sender.name : userId;
        const content = mxEvent.getContent();
        const {msgtype} = content;

        if (msgtype === 'm.key.verification.request') {
            const relations = this.getUnfilteredTimelineSet()
                .getRelationsForEvent(mxEvent.getId(), "m.reference", "m.room.message");
            // figure out the state of the request (done, canceled, ...) by looking at it's relations
            const {to} = content;
            const toMember = room.getMember(to);
            if (to === myUserId) {
                return (<div>{_t("%(name)s (%(userId)s) wants to verify you. If you expected this, you can <a>start verification</a>.",
                    {name, userId}, {a: label => <button onClick={this._onAcceptClicked}>{label}</button>})}</div>);
            } else if (isOwn) {
                return (<div>{_t("You sent a verification request to %(name)s (%(userId)s)",
                    {name: toMember.name, userId: to})}</div>);
            }

        }

        switch (msgtype) {
            case : {
                break;
            }
            case 'm.key.verification.start':
                return (<div>verification started by {name}</div>);
            case 'm.key.verification.cancel':
                return (<div>verification canceled by {name}</div>);
            case 'm.key.verification.done':
                return (<div>verification done by {name}</div>);
        }
    },
});
