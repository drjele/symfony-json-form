<?php

declare(strict_types=1);

/*
 * Copyright (c) Adrian Jeledintan
 */

namespace Drjele\Symfony\JsonForm\Element;

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

    protected function getDataType(): string
    {
        return 'bool';
    }
}
