import React from 'react';

import { assertHas } from '../../helpers';

export default props => {
    assertHas(props, 'modalId');
    assertHas(props, 'modalBody');
    assertHas(props, 'modalTitle');
    assertHas(props, 'modalFooter');

    return (
        <div
          className="modal fade"
          id={ props.modalId }
          tabIndex="-1"
          role="dialog"
          aria-labelledby="myModalLabel"
          aria-hidden="true" >
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <button
                          type="button" className="close" data-dismiss="modal"
                          aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                        <h4 className="modal-title" id="myModalLabel">
                            { props.modalTitle }
                        </h4>
                    </div>
                    <div className="modal-body">
                        { props.modalBody }
                    </div>
                    <div className="modal-footer">
                        { props.modalFooter }
                    </div>
                </div>
            </div>
        </div>
    );
};
