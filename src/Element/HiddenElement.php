<?php

declare(strict_types=1);

/*
 * Copyright (c) Adrian Jeledintan
 */

namespace Drjele\Symfony\JsonForm\Element;

use Drjele\Symfony\JsonForm\Element\Contract\AbstractElement;
use Drjele\Symfony\JsonForm\Exception\InvalidValueException;

class HiddenElement extends AbstractElement
{
    public function __construct(
        string $name
    ) {
        parent::__construct($name, null);
    }

    protected function getType(): string
    {
        return 'hidden';
    }

    protected function renderElement(mixed $value): array
    {
        if (null !== $value && false === \is_scalar($value)) {
            throw new InvalidValueException($this->getName(), $value);
        }

        return [
            'value' => $value,
        ];
    }
}
