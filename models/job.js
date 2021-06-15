"use strict";

const db = require("../db");
const {  NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for jobs. */

class Job {
 /**Create a job from data, update db, return new job data 
  * 
  * data should be {title, salary, equity, company_handle}
  * 
  * returns { id, title, salary, equity, company_handle}
  * 
 */

 static async create({ title, salary, equity, company_handle}){
     const res = await db.query(
         ` INSERT INTO jobs(title, salary, equity, company_handle)
          VALUES ($1, $2, $3, $4)
          RETURNING id, title, salary, equity, company_handle`,
          [title, salary, equity, company_handle],
     );

     const job = res.rows[0];
     return job;
 }


/** FInd all jobs  
 * searchFilters (all optional):
   * - minSalary
   * - hasEquity (true returns only jobs with equity > 0, other values ignored)
   * - title (will find case-insensitive, partial matches)
   *
   * Returns [{ id, title, salary, equity, companyHandle, companyName }, ...]
 * 
*/

static async findAll(search = {}){
    let query = `SELECT j.id,
    j.title,
    j.salary,
    j.equity,
    j.company_handle,
    c.name AS "companyName"
FROM jobs j 
LEFT JOIN companies AS c ON c.handle = j.company_handle ORDER BY title`;
    
    const {title, minSalary, hasEquity} = search;


    if(minSalary !== undefined){
        query = `SELECT j.id,
                        j.title,
                        j.salary,
                        j.equity,
                        j.company_handle,
                        c.name as "companyName"
                        FROM jobs j
                        LEFT JOIN companies as c on c.handle = j.company_handle
                        WHERE salary >= ${minSalary} ORDER BY title`
    }        

    if(hasEquity === true){
        query = `SELECT j.id,
                        j.title,
                        j.salary,
                        j.equity,
                        j.company_handle,
                        c.name as "companyName"
                        FROM jobs j
                        LEFT JOIN companies as c on c.handle = j.company_handle
                        WHERE equity > 0 ORDER BY title`
                    }

    if(title !== undefined){
        query = `SELECT j.id,
                        j.title,
                        j.salary,
                        j.equity,
                        j.company_handle,
                        c.name as "companyName"
                        FROM jobs j
                        LEFT JOIN companies as c on c.handle = j.company_handle
                        WHERE title  ILIKE '%${title}%' ORDER BY title`
                        
                    }

    const jobRes =  await db.query(query);
    console.log(jobRes)
    return jobRes.rows;
}

/**Given a job id return data about job.
 * 
 * Returns {id, title, salary, equity, company_handle}
 * 
 * Throw NotFoundError if not found.
 */
static async get(id){
    const jobRes = await db.query(
        `SELECT id, title, salary, equity, company_handle
         FROM jobs 
         WHERE id = $1`, [id]
    );

     const job = jobRes.rows[0];

     if(!job) throw new NotFoundError(` No Job with id ${id}` )
    
     const companiesRes = await db.query(
        `SELECT handle,
                name,
                description,
                num_employees AS "numEmployees",
                logo_url AS "logoUrl"
         FROM companies
         WHERE handle = $1`, [job.company_handle]);

  delete job.company_handle;
  job.company = companiesRes.rows[0];


     return job;
}


/**Update job data with data.
 * 
 * This is a "partial update"--- its fine if data doesnt contain all fields
 * this only changes provided ones.
 * 
 * data can include: {title, salary, equity}
 * 
 * Returns {id, title, salary, equity, company_handle}
 * 
 * throws NotFoundError if job not found
*/
static async update(id, data){
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
            title: "title",
            salary: "salary",
            equity: "equity",
        }
    );
    const idIdx = "$" + (values.length + 1);

    const querySql = `UPDATE jobs 
                        SET ${setCols}
                        WHERE id = ${idIdx}
                        RETURNING id, title, salary, equity, company_handle`;
    
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No Job with id ${id}`)
    return job;
}

/** Delete given job from database 
 * 
 * returns undefined
 * 
 * throws NotFoundError if job not found.
*/

static async remove(id){
    const result = await db.query(
        `DELETE FROM jobs WHERE id=$1
        RETURNING id`,[id]
    );
    const job = result.rows[0];

    if(!job) throw new NotFoundError(`No Job found with id ${id}`)
}


}

module.exports = Job;