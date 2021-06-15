"use strict";

/***** Routes for jobs. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { isAdmin } = require("../middleware/auth");
const Job = require("../models/job");

const jobNewSchema = require("../schemas/jobNew.json");
const jobSearchSchema = require("../schemas/jobSearch.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json")

const router = express.Router({ mergeParams: true });



/******* POST/ {job} => {job}
 * 
 * job should have {title, salary, equity, company_handle}
 * 
 * returns {id, title, salary, equity, company_handle}
 * 
 * Authorization required: admin
 */

 router.post("/", isAdmin, async function(req, res, next){
     try{
        const validator = jsonschema.validate(req.body, jobNewSchema);
        if(!validator.valid){
            const errs = validator.errors.map(e=>e.stack);
            throw new BadRequestError(errs);
        }
        const job = await Job.create(req.body);
        return res.status(201).json({ job })
     }catch(err){
         return next(err);
     }
 });

 /************GET =>
  * { jobs: [{id, title, salary, equity, company_handle}]}
  * 
  * can filter on provided search filters:
  * -title
  * -minSalary
  * -hasEquity( if true, filter to jobs that provide a 
  * non-zero amount of equity. If false or not included 
  * in the filtering, list all jobs regardless of equity.)
  * Authorization required: none
 */
 router.get("/", async function(req, res, next){
     const search = req.query;
    
     if(search.minSalary !== undefined){
        search.minSalary = Number(search.minSalary);
     }
     search.hasEquity = search.hasEquity === "true";
     try{
        const validator = jsonschema.validate(search, jobSearchSchema);
        if (!validator.valid) {
          const errs = validator.errors.map(e => e.stack);
          throw new BadRequestError(errs);
        }
        const jobs = await Job.findAll(search);
        return res.json({ jobs });
     }catch(err){
         return next(err);
     }  
 });


 /********Get by job id =>{ job }
  * 
  * job is {title, salary, equity, company_handle}
  * 
  * Authorization required: none
 */

 router.get("/:id", async function(req, res, next){
     try{
        const job = await Job.get(req.params.id);
        return res.json({ job });
     }catch(err){
         return next(err);
     }
 })

 /********PATCH/[id] 
  * 
  * patches job data
  * 
  * fields can be {title, salary, equity}
  * 
  * returns { id, title, salary, equity, company_handle }
  * 
  * Authorization required: admin
 */

 router.patch("/:id", isAdmin, async function(req, res, next){
     try{
         const validator = jsonschema.validate(req.body, jobUpdateSchema);
         if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
          }
        const job = await Job.update(req.params.id, req.body);
        return res.json({ job })

     }catch(err){
         return next(err);
     }
 });

 /**********DELETE/[id]=>{deleted:handle}
  * 
  * Authorization: admin
  */

  router.delete("/:id", isAdmin, async function(req, res, next){
      try{
        await Job.remove(req.params.id);
        return res.json({ deleted: +req.params.id });
      }catch(err){
          return next(err);
      }
  });

  module.exports = router;