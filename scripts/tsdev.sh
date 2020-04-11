#!/bin/bash

set -e

TSC_WATCHFILE=UseFsEventsWithFallbackDynamicPolling yarn run tsc -w --incremental --preserveWatchOutput
