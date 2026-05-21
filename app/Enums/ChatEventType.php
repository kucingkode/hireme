<?php

namespace App\Enums;

enum ChatEventType: string {
    case Chunk = 'chunk';
    case Data = 'data';
}
