<?php

function merge_cv(object $old_cv, object $cv_delta) {
    return (object) array_merge((array) $old_cv, (array) $cv_delta);
}
