#!/bin/bash
# Clones woob in /tmp and sets up a virtual env with everything needed to use
# woob for dev/tests purpose.
#
# Usage: source scripts/woobenv.sh
#
# Do not execute this script, the activated virtualenv and exported variables
# would not persist in the calling shell, which is required for `woob` to be
# on PATH and for KRESUS_WOOB_DIR to point at the checkout.

# Edit these to point at a fork or different ref.
WOOB_REPO_URL="${WOOB_REPO_URL:-https://gitlab.com/woob/woob.git}"
WOOB_CLONE_DIR="${WOOB_CLONE_DIR:-/tmp/woob}"
WOOB_BRANCH="${WOOB_BRANCH:-master}"

# Refuse to run when executed instead of sourced: the venv activation would
# be constrained within its shell and not propagate.
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    echo "woobenv.sh: must be sourced, not executed. Run: source ${BASH_SOURCE[0]}" >&2
    exit 1
fi

setup_woob_env() {
    local venv_activate="${WOOB_CLONE_DIR}/woobvenv/bin/activate"
    local fresh_install=0

    if [[ ! -d "${WOOB_CLONE_DIR}/.git" ]]; then
        git clone "${WOOB_REPO_URL}" "${WOOB_CLONE_DIR}" || return 1
    fi

    pushd "${WOOB_CLONE_DIR}" >/dev/null || return 1

    git checkout -q "${WOOB_BRANCH}" || { popd >/dev/null; return 1; }

    if [[ -f "${venv_activate}" ]]; then
        source "${venv_activate}"
    else
        fresh_install=1
        python -m virtualenv woobvenv || { popd >/dev/null; return 1; }
        source "${venv_activate}"
        pip install --upgrade pip setuptools || { popd >/dev/null; return 1; }
        pip install -e . || { popd >/dev/null; return 1; }
        source tools/common.sh
    fi

    local woob_datadir="${HOME}/.config/woob/"
    mkdir -p "${woob_datadir}"
    local sources_line="file://${WOOB_CLONE_DIR}/modules"
    local sources_file="${woob_datadir}sources.list"
    if [[ ! -f "${sources_file}" ]] || [[ "$(cat "${sources_file}")" != "${sources_line}" ]]; then
        echo "${sources_line}" > "${sources_file}"
    fi

    export WOOB_DATADIR="${woob_datadir}"

    case ":${PATH}:" in
        *":${HOME}/.local/bin:"*) ;;
        *) export PATH="${PATH}:${HOME}/.local/bin" ;;
    esac

    if [[ "${fresh_install}" -eq 1 ]]; then
        woob config update
        echo "woobenv.sh: fresh install complete (${WOOB_CLONE_DIR})."
    else
        echo "woobenv.sh: re-activated existing venv (${WOOB_CLONE_DIR})."
    fi

    popd >/dev/null
}

setup_woob_env

# Since the script is sourced, not executed, remove the function from the shell
unset -f setup_woob_env
