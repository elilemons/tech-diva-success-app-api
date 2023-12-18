import { CollectionConfig } from 'payload/types'
import { isAdminOrUsersSurvey } from '../../access/roles'
import { statusField } from '../../fields/status'
import QuestionSets from '../QuestionSets'
import Users from '../Users'
import { getTodaysSurveyEndpoint } from './endpoints/getTodaysSurvey'
import beforeChangeHook from './hooks/beforeChange'

const Surveys: CollectionConfig = {
  slug: 'surveys',
  access: {
    create: () => true,
    read: isAdminOrUsersSurvey,
    update: isAdminOrUsersSurvey,
    delete: isAdminOrUsersSurvey,
  },
  admin: {
    useAsTitle: 'title',
  },
  hooks: {
    beforeChange: [beforeChangeHook],
  },
  endpoints: [
    {
      path: '/get-todays-survey',
      method: 'get',
      handler: getTodaysSurveyEndpoint,
    },
  ],
  defaultSort: '-surveyDate',
  fields: [
    {
      name: 'title',
      label: 'Title',
      type: 'text',
    },
    {
      ...statusField,
    },
    {
      name: 'pointsEarned',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'surveyDate',
      type: 'date',
      defaultValue: new Date().toString(),
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'd MMM yyy',
        },
      },
      required: true,
    },
    {
      name: 'surveyUser',
      type: 'relationship',
      relationTo: Users.slug,
      required: false,
    },
    {
      name: 'surveyQuestionSets',
      type: 'relationship',
      relationTo: QuestionSets.slug,
      hasMany: true,
      label: 'Survey Question Sets',
    },
  ],
}

export default Surveys
