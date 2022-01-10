<?php

declare(strict_types=1);

/*
 * Copyright (c) Adrian Jeledintan
 */

namespace Drjele\Symfony\JsonForm\Element;

use Drjele\Symfony\JsonForm\Exception\InvalidValueException;

class LabelElement extends AbstractElement
{
    public function __construct(
        string $name
    ) {
        $this->name = $name;
    }

    protected function getType(): string
    {
        return 'label';
    }

    protected function renderElement($value): array
    {
        if (null !== $value && (\is_scalar($value) && !\is_array($value)) === false) {
            throw new InvalidValueException($this->name, $value);
        }

        return [
            'label' => $value,
        ];
    }
}
