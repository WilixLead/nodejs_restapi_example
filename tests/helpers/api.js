/**
 * Created by Dmitry on 12.05.2016.
 */

/**
 * All errors returns via api equally. We should additionally check only types
 * @param res Response from superrequest
 * @param errorType API erro type
 */
this.checkError = function(res, errorType) {
    res.status.should.equal(200);
    res.body.should.have.property('success');
    res.body.success.should.equal(false);
    res.body.should.have.property('error');
    res.body.error.should.have.property('message');
    res.body.error.message.should.equal(errorType.message);
};

/**
 * All success responses should contain success
 * @param res Response from superrequest
 */
this.checkSuccessPart = function(res) {
    res.status.should.equal(200);
    res.body.should.have.property('success');
    res.body.success.should.equal(true);
};

module.exports = this;