import { Admin, Doc, Survey, UserOnRequest } from '@elilemons/diva-score-lib'
import Surveys from '..'
import { createSurvey, deleteSurvey, getAdmin } from '../../../tests/helpers'
import { mockQuestionSets } from '../../QuestionSets/tests/mock'

describe('Surveys', () => {
  let admin: UserOnRequest<Admin>
  let adminToken: string
  let headers: Headers
  let testSurvey: Doc<Survey>

  beforeAll(async () => {
    admin = await getAdmin()
    adminToken = admin.token
    headers = new Headers({
      'Content-Type': 'application/json',
      Authorization: `JWT ${adminToken}`,
    })
  })

  describe('it should test creating a survey', () => {
    beforeAll(async () => {
      testSurvey = await createSurvey({ headers })
    })

    afterAll(async () => {
      await deleteSurvey({ surveyId: testSurvey.doc.id, headers })
    })

    it('should have 5 question sets', () => {
      expect(testSurvey.doc.surveyQuestionSets.length).toBeGreaterThan(0)
      expect(testSurvey.doc.surveyQuestionSets.length).toBe(mockQuestionSets.length)
    })

    it('should be set to todays date', () => {
      expect(new Date(testSurvey.doc.surveyDate).setHours(0, 0, 0, 0)).toBe(
        new Date(Date.now()).setHours(0, 0, 0, 0),
      )
    })

    it('should have set the user to the test admin user', () => {
      expect(testSurvey.doc.surveyUser).toBe(admin.user.id)
    })

    it('should not allow the user to create more than one survey a day', async () => {
      const secondSurvey = await fetch(
        `${process.env.PAYLOAD_PUBLIC_SERVER_URL}/api/${Surveys.slug}`,
        {
          method: 'post',
          headers,
          body: JSON.stringify({
            title: 'Test Survey 2',
          }),
        },
      ).then((res) => res.json())

      expect(secondSurvey).toEqual({ errors: [{ message: 'Something went wrong.' }] })
    })
  })

  describe('should test finding todays survey', () => {
    it('should not find a survey', async () => {
      const res = await fetch(
        `${process.env.PAYLOAD_PUBLIC_SERVER_URL}/api/${Surveys.slug}/get-todays-survey`,
        {
          method: 'get',
          headers,
        },
      ).then((res) => {
        expect(res.status).toBe(200)
        return res.json()
      })

      expect(res.id).toBeUndefined()
    })

    it('should find a survey', async () => {
      const testSurvey2 = await fetch(
        `${process.env.PAYLOAD_PUBLIC_SERVER_URL}/api/${Surveys.slug}`,
        {
          method: 'post',
          headers,
          body: JSON.stringify({
            title: 'Test Survey',
          }),
        },
      ).then((res) => res.json())

      const res = await fetch(
        `${process.env.PAYLOAD_PUBLIC_SERVER_URL}/api/${Surveys.slug}/get-todays-survey`,
        {
          method: 'get',
          headers,
        },
      ).then((res) => {
        expect(res.status).toBe(200)
        return res.json()
      })

      expect(res.id).toBe(testSurvey2.doc.id)

      await deleteSurvey({
        surveyId: testSurvey2.doc.id,
        headers,
      })
    })
  })

  // describe('it should test scoring a survey', () => {
  //   let surveyToScore: Survey

  //   beforeAll(async () => {
  //     surveyToScore = await createSurvey({ headers }).then((res) => res.doc)
  //   })

  //   afterAll(() => {
  //     deleteSurvey({ surveyId: surveyToScore.id, headers })
  //   })

  //   it('should get the best score possible', async () => {
  //     const answeredSurvey = { ...surveyToScore }

  //     const result = await fetch(
  //       `${process.env.PAYLOAD_PUBLIC_SERVER_URL}/api/${Surveys.slug}/score-survey`,
  //       {
  //         method: 'post',
  //         headers,
  //         body: JSON.stringify({
  //           answeredSurvey,
  //         }),
  //       },
  //     )

  //     expect(result).toBe({ score: 9 })
  //   })

  //   it('should not get any points', async () => {
  //     const answeredSurvey = { ...surveyToScore }
  //     const result = await fetch(
  //       `${process.env.PAYLOAD_PUBLIC_SERVER_URL}/api/${Surveys.slug}/score-survey`,
  //       {
  //         method: 'post',
  //         headers,
  //         body: JSON.stringify({
  //           answeredSurvey,
  //         }),
  //       },
  //     )

  //     expect(result).toBe({ score: 0 })
  //   })

  //   it('should get 6 points', async () => {
  //     const answeredSurvey = { ...surveyToScore } // TODO complete goals and mind
  //     const result = await fetch(
  //       `${process.env.PAYLOAD_PUBLIC_SERVER_URL}/api/${Surveys.slug}/score-survey`,
  //       {
  //         method: 'post',
  //         headers,
  //         body: JSON.stringify({
  //           answeredSurvey,
  //         }),
  //       },
  //     )

  //     expect(result).toBe({ score: 0 })
  //   })
  // })
})
