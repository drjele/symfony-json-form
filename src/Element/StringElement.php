<?php

declare(strict_types=1);

/*
 * Copyright (c) Adrian Jeledintan
 */

namespace Drjele\Symfony\JsonForm\Element;

final class StringElement extends AbstractElement
{
    public function render($value): array
    {
        if (null !== $value && !\is_string($value)) {
            $this->throwInvalidValueException();
        }

        return $this->renderBase() + [
            'value' => $value,
        ];
    }

    protected function getType(): string
    {
        return 'string';
    }
}
