"use strict";

const request = require("supertest");
const {NotFoundError, BadRequestError} = require("../expressError")
const db = require("../db");
const app = require("../app");

const{
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll, 
    testJobIds,   
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/*************************** create */

describe("create", function(){
    const newJob = {
        title: "Job1",
        salary: 100,
        equity: 0.1,
        company_handle: "c1",
    };

    test("works", async function(){
        let job = await job.create(newJob);
        expect(job).toEqual(newJob);

            expect(result.rows).toEqual([
                {
                    title: "Job1",
                    salary: 100,
                    equity: 0.1,
                    company_handle: "c1",
                },
            ]);
    });
});

/**********findAll */

describe("findAll", function(){
    test("works: no filter", async function(){
        let jobs = await Job.findAll();
        expect(jobs).toEqual([
            {
                id: testJobIds[0],
                title: "Job1",
                salary: 100,
                equity: "0.1",
                company_Handle: "c1",
                companyName: "C1",
            },
            {
        id: testJobIds[1],
        title: "Job2",
        salary: 200,
        equity: "0.2",
        company_Handle: "c1",
        companyName: "C1",
      },
      {
        id: testJobIds[2],
        title: "Job3",
        salary: 300,
        equity: "0",
        company_Handle: "c1",
        companyName: "C1",
      },
      {
        id: testJobIds[3],
        title: "Job4",
        salary: null,
        equity: null,
        company_Handle: "c1",
        companyName: "C1",
      },
        ]);
    });
});

/***********get by id */
describe("get", function(){
    test("works", async function(){
        let job = await Job.get(testJobIds[0]);
        expect(job).toEqual({
            id: testJobIds[0],
            title: "Job1",
            salary: 100,
            equity: "0.1",
            company:{
                handle: "c1",
                name: "C1",
                description: "Desc1",
                numEmployees: 1,
                logoUrl: "http://c1.img",
            },
        });
    });

    test("not found if no such job", async function(){
        try{
            await Job.get(0);
            fail();
        }catch(err){
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});

/********************update */

describe("update", function(){
    let updateData = {
        title: "New",
        salary: 500,
        equity: "0.5",
    };

    test("works", async function(){
        let job = await Job.update(testJobIds[0], updateData);
        expect(job).toEqual({
            id: testJobIds[0],
            company_handle: "c1",
            ...updateData,
        });
    });

    test("not found if no such job", async function () {
        try {
          await Job.update(0, {
            title: "test",
          });
          fail();
        } catch (err) {
          expect(err instanceof NotFoundError).toBeTruthy();
        }
      });
    
      test("bad request with no data", async function () {
        try {
          await Job.update(testJobIds[0], {});
          fail();
        } catch (err) {
          expect(err instanceof BadRequestError).toBeTruthy();
        }
      });
    });
    
    /************************************** remove */
    
    describe("remove", function () {
      test("works", async function () {
        await Job.remove(testJobIds[0]);
        const res = await db.query(
            "SELECT id FROM jobs WHERE id=$1", [testJobIds[0]]);
        expect(res.rows.length).toEqual(0);
      });
    
      test("not found if no such job", async function () {
        try {
          await Job.remove(0);
          fail();
        } catch (err) {
          expect(err instanceof NotFoundError).toBeTruthy();
        }
      });
    });
    