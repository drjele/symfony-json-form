<?php

declare(strict_types=1);

/*
 * Copyright (c) Adrian Jeledintan
 */

namespace Drjele\SymfonyJsonForm\Element;

final class BoolElement extends AbstractElement
{
    public function render($value): array
    {
        if (null !== $value && !\is_bool($value)) {
            $this->throwInvalidValueException();
        }

        return $this->renderBase() + [
            'value' => $value,
        ];
    }

    protected function getType(): string
    {
        return 'bool';
    }
}
