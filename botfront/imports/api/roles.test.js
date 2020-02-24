import { Meteor } from 'meteor/meteor';
import { expect } from 'chai';
import { setScopes } from '../lib/scopes';
import { Projects } from './project/project.collection';
import { Conversations } from './conversations';

// eslint-disable-next-line import/named
import { setUpRoles } from './roles/roles'; // is declared inside an if statement

import './project/project.methods';
import './nlu_model/nlu_model.methods';
import './importExport/import.methods';
import './importExport/export.methods';
import './endpoints/endpoints.methods';
import './globalSettings/globalSettings.methods';
import './instances/instances.collection';
import './instances/instances.methods';
import './setup';
import './slots/slots.methods';
import './story/stories.methods';
import './storyGroups/storyGroups.methods';
import './user/user.methods';

setUpRoles();

const projectId = 'bf';
const modelId = 'bfModel';
const formatRoles = (roles, project) => ({ roles: [{ roles, project }] });
const userId = 'testuserid';

const projectData = {
    _id: projectId,
    disabled: false,
    name: 'trial',
    namespace: 'bf-trial',
    defaultLanguage: 'en',
    defaultDomain: {
        content:
            // eslint-disable-next-line max-len
            'slots:\n  disambiguation_message:\n    type: unfeaturized\nactions:\n  - action_botfront_disambiguation\n  - action_botfront_disambiguation_followup\n  - action_botfront_fallback\n  - action_botfront_mapping',
    },
    nluThreshold: 0.75,
    timezoneOffset: 0,
    nlu_models: [modelId],
    updatedAt: '2020-02-18T16:44:24.809Z',
    deploymentEnvironments: [],
};

const roles = [
    'nlu-data:r',
    'nlu-data:w',
    'nlu-data:x',
    'responses:r',
    'responses:w',
    'stories:r',
    'stories:w',
    'triggers:r',
    'triggers:w',
    'incoming:r',
    'incoming:w',
    'analytics:r',
    'projects:r',
    'projects:w',
    'global-settings:r',
    'global-settings:w',
    'roles:r',
    'roles:w',
    'users:r',
    'users:w',
    'global-admin',
];

// const specialCases = [
//     'importProject'
// ]

const readers = {
    nluData: [
        'nlu-data:r',
        'nlu-data:w',
        'stories:r',
        'stories:w',
        'triggers:r',
        'triggers:w',
        'incoming:r',
        'incoming:w',
        'analytics:r',
        'global-admin',
        'projects:w',
        'projects:r',
    ],
    responses: [
        'responses:r',
        'responses:w',
        'stories:r',
        'stories:w',
        'triggers:r',
        'triggers:w',
        'incoming:r',
        'incoming:w',
        'analytics:r',
        'global-admin',
        'projects:w',
        'projects:r',
    ],
    incoming: [
        'incoming:r',
        'incoming:w',
        'analytics:r',
        'global-admin',
        'projects:w',
        'projects:r',
    ],
    analytics: [
        'analytics:r',
        'global-admin',
        'projects:w',
        'projects:r',
    ],
    roles: [
        'roles:r',
        'roles:w',
        'users:w',
        'global-admin',
        'projects:w',
        'projects:r',
    ],
    projects: [
        'projects:w',
        'projects:r',
        'global-admin',
    ],
    stories: [
        'stories:r',
        'stories:w',
        'triggers:r',
        'triggers:w',
        'incoming:r',
        'incoming:w',
        'analytics:r',
        'global-admin',
        'projects:w',
        'projects:r',
    ],
    users: [
        'users:r',
        'golbal-admin',
    ],
};

const writers = {
    nluData: [
        'nlu-data:w',
        'incoming:w',
        'global-admin',
    ],
    responses: [
        'responses:w',
        'global-admin',
    ],
    nluModel: [
        'nlu-data:w',
        'global-admin',
    ],
    analytics: [
        'incoming:w',
        'global-admin',
    ],
    activity: [
        'nlu-data:w',
        'nlu-data:w',
        'incoming:w',
        'global-admin',
    ],
    incoming: [
        'incoming:w',
        'global-admin',
    ],
    roles: [
        'roles:w',
        'global-admin',
    ],
    projects: [
        'projects:w',
        'global-admin',
    ],
    globalSettings: [
        'global-settings:w',
        'global-admin',
    ],
    stories: [
        'stories:w',
        'global-admin',
    ],
    triggers: [
        'triggers:w',
        'global-admin',
    ],
    users: [
        'users:w',
        'global-admin',
    ],
};

const otherRoles = {
    nluModelX: [
        'nlu-data:x',
        'global-admin',
    ],
};

const methods = [
    {
        name: 'conversations.markAsRead',
        roles: readers.incoming,
        args: ['senderId'],
    },
    {
        name: 'conversations.updateStatus',
        roles: readers.incoming,
        args: ['senderId'],
    },
    {
        name: 'conversations.delete',
        roles: writers.incoming,
        args: ['senderId'],
    },
    {
        name: 'policies.save',
        roles: writers.projects,
        args: [{ projectId }],
    },
    {
        name: 'credentials.save',
        roles: writers.projects,
        args: [{ projectId }],
    },
    {
        name: 'endpoints.save',
        roles: writers.projects,
        args: [{ projectId }],
    },
    {
        name: 'settings.save',
        roles: writers.globalSettings,
        args: [],
        rejectProjectScope: true,
    },
    {
        name: 'exportProject',
        roles: readers.projects,
        args: [null, projectId, null],
    },
    {
        name: 'exportRasa',
        roles: readers.projects,
        args: [projectId, {}],
    },
    {
        name: 'importProject',
        roles: writers.projects,
        args: [null, null, projectId],
    },
    {
        name: 'instance.update',
        roles: writers.projects,
        args: [{ projectId }],
    },
    {
        name: 'rasa.parse',
        roles: readers.nluData,
        args: [{ projectId }],
    },
    {
        name: 'rasa.convertToJson',
        roles: writers.nluModel,
        args: [null, { _id: modelId }],
    },
    {
        name: 'rasa.getTrainingPayload',
        roles: otherRoles.nluModelX,
        args: [projectId],
    },
    {
        name: 'rasa.train',
        roles: otherRoles.nluModelX,
        args: [projectId],
    },
    {
        name: 'rasa.evaluate.nlu',
        roles: otherRoles.nluModelX,
        args: [null, projectId],
    },
    {
        name: 'nlu.insertExamplesWithLanguage',
        roles: [...writers.nluData, 'stories:w'],
        args: [projectId],
    },
    {
        name: 'nlu.insertExamples',
        roles: writers.nluData,
        args: [modelId],
    },
    {
        name: 'nlu.updateExample',
        roles: writers.nluData,
        args: [modelId],
    },
    {
        name: 'nlu.switchCanonical',
        roles: writers.nluData,
        args: [modelId],
    },
    {
        name: 'nlu.deleteExample',
        roles: writers.nluData,
        args: [modelId],
    },
    {
        name: 'nlu.upsertEntitySynonym',
        roles: writers.nluData,
        args: [modelId],
    },
    {
        name: 'nlu.deleteEntitySynonym',
        roles: writers.nluData,
        args: [modelId],
    },
    {
        name: 'nlu.upsertEntityGazette',
        roles: writers.nluData,
        args: [modelId],
    },
    {
        name: 'nlu.deleteEntityGazette',
        roles: writers.nluData,
        args: [modelId],
    },
    {
        name: 'nlu.insert',
        roles: writers.nluModel,
        args: [null, projectId],
    },
    {
        name: 'nlu.update',
        roles: writers.nluModel,
        args: [modelId],
    },
    {
        name: 'nlu.update.general',
        roles: otherRoles.nluModelX,
        args: [modelId],
    },
    {
        name: 'nlu.remove',
        roles: writers.nluModel,
        args: [modelId],
    },
    {
        name: 'nlu.getChitChatIntents',
        roles: readers.nluData,
        args: [modelId],
    },
    {
        name: 'nlu.addChitChatToTrainingData',
        roles: writers.nluData,
        args: [modelId],
    },
    {
        name: 'nlu.updateChitChatIntents',
        roles: writers.nluData,
        args: [modelId],
    },
    {
        name: 'nlu.import',
        roles: writers.nluData,
        args: [null, modelId],
    },
    {
        name: 'nlu.renameIntent',
        roles: writers.nluData,
        args: [modelId],
    },
    {
        name: 'nlu.removeExamplesByIntent',
        roles: writers.nluData,
        args: [modelId],
    },
    {
        name: 'nlu.getUtteranceFromPayload',
        roles: readers.nluData,
        args: [projectId],
    },
    {
        name: 'nlu.chitChatSetup',
        roles: writers.projects,
        args: [],
        rejectProjectScope: true,
    },
    {
        name: 'project.insert',
        roles: writers.projects,
        args: [],
        rejectProjectScope: true,
    },
    {
        name: 'project.update',
        roles: writers.projects,
        args: [{ _id: projectId }],
    },
    {
        name: 'project.delete',
        roles: writers.projects,
        args: [],
        rejectProjectScope: true,
    },
    {
        name: 'project.markTrainingStarted',
        roles: otherRoles.nluModelX,
        args: [projectId],
    },
    {
        name: 'project.markTrainingStopped',
        roles: otherRoles.nluModelX,
        args: [projectId],
    },
    {
        name: 'project.getEntitiesAndIntents',
        roles: [...readers.nluData, ...readers.responses],
        args: [projectId],
    },
    {
        name: 'project.getActions',
        roles: [...readers.nluData, ...readers.responses],
        args: [projectId],
    },
    {
        name: 'project.getDefaultLanguage',
        roles: [...readers.nluData, ...readers.responses],
        args: [projectId],
    },
    {
        name: 'project.getDeploymentEnvironments',
        roles: [...readers.incoming, ...readers.projects],
        args: [projectId],
    },
    {
        name: 'slots.insert',
        roles: writers.stories,
        args: [null, projectId],
    },
    {
        name: 'slots.update',
        roles: writers.stories,
        args: [null, projectId],
    },
    {
        name: 'slots.delete',
        roles: writers.stories,
        args: [null, projectId],
    },
    {
        name: 'slots.getSlots',
        roles: readers.stories,
        args: [projectId],
    },
    {
        name: 'stories.insert',
        roles: writers.stories,
        args: [{ projectId }],
    },
    {
        name: 'stories.update',
        roles: writers.stories,
        args: [{ projectId }, projectId],
    },
    {
        name: 'stories.delete',
        roles: writers.stories,
        args: [{ projectId }, projectId],
    },
    {
        name: 'stories.addCheckpoints',
        roles: writers.stories,
        args: [projectId],
    },
    {
        name: 'stories.removeCheckpoints',
        roles: writers.stories,
        args: [projectId],
    },
    {
        name: 'stories.updateRules',
        roles: writers.triggers,
        args: [projectId],
    },
    {
        name: 'stories.deleteRules',
        roles: writers.triggers,
        args: [projectId],
    },
    {
        name: 'storyGroups.delete',
        roles: writers.stories,
        args: [{ projectId }],
    },
    {
        name: 'storyGroups.insert',
        roles: writers.stories,
        args: [{ projectId }],
    },
    {
        name: 'storyGroups.update',
        roles: writers.stories,
        args: [{ projectId }],
    },
    {
        name: 'storyGroups.removeFocus',
        roles: writers.stories,
        args: [projectId],
    },
    {
        name: 'storyGroups.deleteChildStories',
        roles: writers.stories,
        args: [null, projectId],
    },
    {
        name: 'user.create',
        roles: writers.users,
        args: [],
        rejectProjectScope: true,
    },
    {
        name: 'user.update',
        roles: writers.users,
        args: [],
        rejectProjectScope: true,
    },
    {
        name: 'user.remove',
        roles: writers.users,
        args: [],
        rejectProjectScope: true,
    },
    {
        name: 'user.removeByEmail',
        roles: writers.users,
        args: [],
        rejectProjectScope: true,
    },
    {
        name: 'user.changePassword',
        roles: writers.users,
        args: [],
        rejectProjectScope: true,
    },
    {
        name: 'user.remove',
        roles: writers.users,
        args: [],
        rejectProjectScope: true,
    },
    {
        name: 'user.removeByEmail',
        roles: writers.users,
        args: [],
        rejectProjectScope: true,
    },
    {
        name: 'user.changePassword',
        roles: writers.users,
        args: [],
        rejectProjectScope: true,
    },
];
if (Meteor.isServer) {
    const setUserScopes = async (userRoles, scope) => {
        await setScopes(formatRoles(userRoles, scope), userId);
    };
    
    const createTestUser = async () => {
        await Meteor.users.remove({ _id: 'testuserid' });
        await Meteor.users.insert({
            _id: 'testuserid',
            services: {
                password: {
                    bcrypt:
                        '$2a$10$YZwBKpTo03dZLlR1sZyCyeni3..3kAcVwG7EIZ.P0e/o6P2weEqEu',
                },
                resume: {
                    loginTokens: [
                        {
                            when: '2020-02-18T16:42:18.967Z',
                            hashedToken: 'oAd1ARWfrH+OWOAWfeBRgrJ8xUS++jwcDETewvEC/uA=',
                        },
                    ],
                },
            },
            emails: [{ address: 'test@test.com', verified: false }],
            profile: { firstName: 'test', lastName: 'test' },
        });
    };
    
    const deleteTestUser = async () => {
        await Meteor.users.remove({ _id: 'testuserid' });
        await Meteor.roleAssignment.remove({ user: { _id: userId } });
    };
    
    const createProject = async () => {
        await Projects.insert(projectData);
    };
    const deleteProject = async () => {
        await Projects.remove({ _id: 'bf' });
    };
    const addConversation = async () => {
        await Conversations.insert({
            _id: 'senderId',
            projectId: 'bf',
        });
    };
    const removeConversation = async () => {
        await Conversations.remove({ _id: 'senderId' });
    };
    
    const testMethod = async (method, role, scope, args, callback) => {
        try {
            await deleteTestUser();
            await deleteProject();
            await removeConversation();
            await createTestUser();
            await createProject();
            await addConversation();
            await setUserScopes(role, scope);
            Meteor.apply(method, args, callback);
        } catch (e) {
            console.log(e);
        }
    };

    describe('zz test', () => {
        // special test required for initialSetup
        // createDefaultStoryGroup
        // createIntroStoryGroup
        methods.forEach((method) => {
            roles.forEach((role) => {
                it(`calling ${method.name} as ${role} global scope`, (done) => {
                    testMethod(method.name, role, 'GLOBAL', method.args, (e = {}) => {
                        if (method.roles.includes(role)) {
                            expect(e.error).to.not.equal('403');
                        } else {
                            expect(e.error).to.be.equal('403');
                        }
                        done();
                    });
                });
                it(`calling ${method.name} as ${role} project scope`, (done) => {
                    testMethod(method.name, role, 'bf', method.args, (e = {}) => {
                        if (method.roles.includes(role) && !method.rejectProjectScope) {
                            expect(e.error).to.not.equal('403');
                        } else {
                            expect(e.error).to.be.equal('403');
                        }
                        done();
                    });
                });
                it(`calling ${method.name} as ${role} wrong project scope`, (done) => {
                    testMethod(method.name, role, 'DNE', method.args, (e = {}) => {
                        expect(e.error).to.be.equal('403');
                        done();
                    });
                });
            });
        });
    });
}
